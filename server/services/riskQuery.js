import { ApplicationCredentialsManager, request, appendCustomParams } from '@esri/arcgis-rest-request'
import { riskData } from './riskData.js'
import { dataConfig } from '../config.js'
import { performance } from 'node:perf_hooks'
import fs from 'fs'
import path from 'path'

let riskQueries = []
let riversSeaDepthQueries = []
let surfaceWatchDepthQueries = []
let riskQueriesLoaded = false

function loadRiskQueries () {
  const filePath = path.join('./server/services/definition/', dataConfig.dataVersion)
  const queryData = fs.readFileSync(path.join(filePath, 'riskQueries.json'))
  const rsData = fs.readFileSync(path.join(filePath, 'riversSeaDepth.json'))
  const swData = fs.readFileSync(path.join(filePath, 'surfaceWaterDepth.json'))
  riskQueries = JSON.parse(queryData)
  riversSeaDepthQueries = JSON.parse(rsData)
  surfaceWatchDepthQueries = JSON.parse(swData)
  riskQueriesLoaded = true
}

function processEsriHeaders (response) {
  // check if response.json() is a function, if it's not, then we didn't use rawResponse: true
  if (typeof response.json !== 'function') {
    return Promise.resolve(response)
  }
  if (dataConfig.performanceLogging) {
    const ruPerMin = response.headers.get('x-esri-org-request-units-per-min')
    if (ruPerMin) {
      console.log('{"RequestUnitsPerMinute" : "%s"}', ruPerMin)
    }
  }
  return Promise.resolve(response.json())
}

function checkResult (result, query) {
  return new Promise((resolve, _reject) => {
    if (result.error) {
      console.log('Error: %s', result.error.message)
      throw new Error(`${result.error.code}: ${result.error.message}`)
    }
    if (dataConfig.performanceLogging) {
      const perfData = {
        startTime: query.startTime,
        endTime: performance.now(),
        url: query.url,
        key: query.key,
        layers: query.layers,
        buffer: query.buffer
      }
      perfData.timeTaken = perfData.endTime - perfData.startTime
      query.perfData = perfData
      resolve(result)
    } else {
      resolve(result)
    }
  })
}

const appManager = ApplicationCredentialsManager.fromCredentials({
  clientId: dataConfig.esriClientId,
  clientSecret: dataConfig.esriClientSecret
})

async function _currentToken () {
  return appManager.token
}

function esriRequest (requestOptions) {
  const optionsArray = Object.keys(requestOptions)
  const queryOptions = appendCustomParams(requestOptions, optionsArray, {
    httpMethod: 'GET',
    params: {
      where: '1=1',
      outFields: '*',
      ...requestOptions.params
    }
  })
  return request(`${requestOptions.url}/query`, queryOptions)
}

function bufferGeometry (x, y, querybuffer) {
  const buffer = querybuffer / 2
  return {
    xmin: x - buffer,
    ymin: y - buffer,
    xmax: x + buffer,
    ymax: y + buffer,
    spatialReference: {
      wkid: 27700
    }
  }
}

const runQueries = async (x, y, queries) => {
  const geometry = {
    x,
    y,
    spatialReference: {
      wkid: 27700
    }
  }
  const qRes = await Promise.allSettled(queries.map(query => {
    if (dataConfig.performanceLogging) {
      query.startTime = performance.now()
    }
    if (query.esriCall) {
      const requestOptions = {
        url: query.url,
        spatialRel: 'esriSpatialRelIntersects', // NOSONAR
        cacheHint: true,
        returnGeometry: false,
        geometry,
        geometryType: 'esriGeometryPoint', // NOSONAR
        authentication: appManager.token,
        outFields: query.outFields || undefined,
        rawResponse: true
      }
      if (query.layers) {
        requestOptions.layerDefs = {}
        query.layers.forEach((_layer, element) => {
          requestOptions.layerDefs[element] = ''
        })
        if (query.buffer) {
          requestOptions.geometry = bufferGeometry(x, y, query.buffer)
          requestOptions.geometryType = 'esriGeometryEnvelope' // NOSONAR
        }
      } else {
        if (query.buffer) {
          requestOptions.distance = query.buffer
          requestOptions.units = 'esriSRUnit_Meter' // NOSONAR
        }
      }
      return esriRequest(requestOptions)
        .then((response) => { return processEsriHeaders(response) })
        .then((result) => { return checkResult(result, query) })
    } else {
      return riskData(query.url).then((result) => { return checkResult(result, query) })
    }
  }))
  const results = []
  let err = null
  qRes.forEach((promiseresult, index) => {
    if (promiseresult.status === 'rejected') {
      if (!err) {
        err = new Error(`${promiseresult.reason}`, { cause: queries[index] })
      }
      console.log(`${promiseresult.reason} : %s`, JSON.stringify(queries[index]))
    } else {
      results[index] = promiseresult.value
    }
  })
  if (err) {
    throw err
  }
  return results
}

async function externalQueries (x, y, queries) {
  let tokenStartTime, tokenRefreshTime
  const allPerfData = []
  if ((!appManager.token) || (appManager.expires < Date.now())) {
    await refreshToken()
  }

  const featureLayers = {}

  try {
    let results
    try {
      results = await runQueries(x, y, queries)
    } catch (err) {
      let retry = false
      if (err.message === 'Error: 498: Invalid token.') {
        await refreshToken()
        retry = true
      } else if (err.message.startsWith('Error: 503:')) {
        retry = true
      }
      if (retry) {
        results = await runQueries(x, y, queries)
      } else {
        throw err
      }
    }
    results.forEach((result, index) => {
      if (queries[index].esriCall) {
        if (!((result.features) || (result.layers))) {
          console.log('Error: Invalid response for %s', queries[index].key)
          console.log(result)
          throw new Error(`Invalid response for ${queries[index].key}`)
        }
        if (result.layers) {
          result.layers.forEach((layer, element) => {
            const layerName = queries[index].layers[element]
            featureLayers[layerName] = layer.features
          })
        } else {
          featureLayers[queries[index].key] = result.features
        }
      } else {
        featureLayers[queries[index].key] = result
      }
      if (dataConfig.performanceLogging) {
        allPerfData.push(queries[index].perfData)
      }
    })
    if (dataConfig.performanceLogging) {
      console.log('{"TokenRefreshTime" : %d}', tokenRefreshTime)
      console.log(JSON.stringify(allPerfData))
    }
  } catch (err) {
    const url = err.cause ? err.cause.url : ''
    throw new Error(`Issue with Promise.all call: ${err.message} : ${url}`)
  }
  return featureLayers

  async function refreshToken () {
    if (dataConfig.performanceLogging) {
      tokenStartTime = performance.now()
    }
    await appManager.refreshToken()
    if (dataConfig.performanceLogging) {
      tokenRefreshTime = performance.now() - tokenStartTime
    }
  }
}

const buildQueryList = (queries) => {
  return queries.map(query => ({
    esriCall: true,
    layers: query.layers,
    key: query.key,
    url: query.url,
    outfields: query.outfields,
    buffer: query.buffer
  }))
}

const riskQuery = async (x, y) => {
  if (!riskQueriesLoaded) { loadRiskQueries() }
  const queries = buildQueryList(riskQueries)
  queries.push({
    esriCall: false,
    key: 'extrainfo',
    url: `${dataConfig.riskDataUrl}/${x}/${y}`
  })

  return externalQueries(x, y, queries)
}

const riversAndSeaDepth = async (x, y) => {
  if (!riskQueriesLoaded) { loadRiskQueries() }
  const queries = buildQueryList(riversSeaDepthQueries)
  return externalQueries(x, y, queries)
}

const surfaceWaterDepth = async (x, y) => {
  if (!riskQueriesLoaded) { loadRiskQueries() }
  const queries = buildQueryList(surfaceWatchDepthQueries)
  return externalQueries(x, y, queries)
}

module.exports = { riskQuery, riversAndSeaDepth, surfaceWaterDepth, _currentToken }
