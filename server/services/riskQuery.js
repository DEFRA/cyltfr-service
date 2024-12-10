const { ApplicationCredentialsManager, request, appendCustomParams } = require('@esri/arcgis-rest-request')
const { riskData } = require('./riskData')
const config = require('../config')
const { performance } = require('node:perf_hooks')

let riskQueries = []
let riversSeaDepthQueries = []
let surfaceWatchDepthQueries = []
let reservoirQueries = []
const fs = require('fs')
const path = require('path')
let riskQueriesLoaded = false

function loadRiskQueries () {
  const filePath = path.join('./server/services/definition/', config.dataVersion)
  const queryData = fs.readFileSync(path.join(filePath, 'riskQueries.json'))
  const rsData = fs.readFileSync(path.join(filePath, 'riversSeaDepth.json'))
  const swData = fs.readFileSync(path.join(filePath, 'surfaceWaterDepth.json'))
  const reservoirData = fs.readFileSync(path.join(filePath, 'reservoirQueries.json'))
  riskQueries = JSON.parse(queryData)
  riversSeaDepthQueries = JSON.parse(rsData)
  surfaceWatchDepthQueries = JSON.parse(swData)
  reservoirQueries = JSON.parse(reservoirData)
  riskQueriesLoaded = true
}

function processEsriHeaders (response, esriRequestUnits) {
  // check if response.json() is a function, if it's not, then we didn't use rawResponse: true
  if (typeof response.json !== 'function') {
    return Promise.resolve(response)
  }
  if (config.performanceLogging) {
    const ruPerMin = response.headers.get('x-esri-org-request-units-per-min')
    if (ruPerMin) {
      const ru = ruPerMin.split(';')
      ru[0] = parseInt(ru[0].split('=')[1])
      if ((ru[0] < esriRequestUnits.lowest) || (esriRequestUnits.lowest === 0)) {
        esriRequestUnits.lowest = ru[0]
      }
      if (ru[0] > esriRequestUnits.highest) {
        esriRequestUnits.highest = ru[0]
      }
    }
    // console.log('x-esri-org-request-units-per-min: %s', ruPerMin'))
  }
  return Promise.resolve(response.json())
}

function checkResult (result, query) {
  return new Promise((resolve, _reject) => {
    if (result.error) {
      console.log('Error: %s', result.error.message)
      throw new Error(`${result.error.code}: ${result.error.message}`)
    }
    if (config.performanceLogging) {
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
  clientId: config.esriClientId,
  clientSecret: config.esriClientSecret
})

async function _currentToken () {
  return appManager.token
}

function esriRequest (requestOptions) {
  const optionsArray = Object.keys(requestOptions)
  const queryOptions = appendCustomParams(requestOptions, optionsArray, {
    httpMethod: 'GET',
    params: Object.assign({
      // set default query parameters
      where: '1=1', outFields: '*'
    }, requestOptions.params)
  })
  return request(`${requestOptions.url}/query`, queryOptions)
}

const runQueries = async (x, y, queries) => {
  const geometry = {
    x,
    y,
    spatialReference: {
      wkid: 27700
    }
  }
  const geometryType = 'esriGeometryPoint'
  const spatialRel = 'esriSpatialRelIntersects'
  const returnGeometry = 'false'
  const esriRequestUnits = {
    lowest: 0,
    highest: 0
  }
  const qRes = await Promise.all(queries.map(query => {
    if (config.performanceLogging) {
      query.startTime = performance.now()
    }
    if (query.esriCall) {
      const requestOptions = {
        url: query.url,
        spatialRel,
        // cacheHint: true,
        returnGeometry,
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
          const buffer = query.buffer / 2
          requestOptions.geometry = {
            xmin: x - buffer,
            ymin: y - buffer,
            xmax: x + buffer,
            ymax: y + buffer,
            spatialReference: {
              wkid: 27700
            }
          }
          requestOptions.geometryType = 'esriGeometryEnvelope'
        } else {
          requestOptions.geometry = geometry
          requestOptions.geometryType = geometryType
        }
      } else {
        if (query.buffer) {
          requestOptions.distance = query.buffer
          requestOptions.units = 'esriSRUnit_Meter'
        }
        requestOptions.geometry = geometry
        requestOptions.geometryType = geometryType
      }
      return esriRequest(requestOptions)
        .then((response) => { return processEsriHeaders(response, esriRequestUnits) })
        .then((result) => { return checkResult(result, query) })
    } else {
      return riskData(query.url).then((result) => { return checkResult(result, query) })
    }
  }))
  esriRequestUnits.difference = esriRequestUnits.highest - esriRequestUnits.lowest
  console.log(esriRequestUnits)
  return qRes
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
      if (err.message === '498: Invalid token.') {
        await refreshToken()
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
      if (config.performanceLogging) {
        allPerfData.push(queries[index].perfData)
      }
    })
    if (config.performanceLogging) {
      console.log('{"TokenRefreshTime" : %d}', tokenRefreshTime)
      console.log(JSON.stringify(allPerfData))
    }
  } catch (err) {
    throw new Error(`Issue with Promise.all call: ${err.message}`)
  }
  return featureLayers

  async function refreshToken () {
    if (config.performanceLogging) {
      tokenStartTime = performance.now()
    }
    await appManager.refreshToken()
    if (config.performanceLogging) {
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
    url: `${config.riskDataUrl}/${x}/${y}`
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

const reservoirQuery = async (x, y) => {
  if (!riskQueriesLoaded) { loadRiskQueries() }
  const queries = buildQueryList(reservoirQueries)
  return externalQueries(x, y, queries)
}

module.exports = { riskQuery, riversAndSeaDepth, surfaceWaterDepth, reservoirQuery, _currentToken }
