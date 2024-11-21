const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')
const { queryFeatures } = require('@esri/arcgis-rest-feature-service')
const { riskData } = require('./riskData')
const config = require('../config')
const { performance } = require('node:perf_hooks')

let riskQueries = []
let riversSeaDepthQueries = []
let surfaceWatchDepthQueries = []
const fs = require('fs')
const path = require('path')
let riskQueriesLoaded = false

function loadRiskQueries () {
  const filePath = path.join('./server/services/definition/', config.dataVersion)
  const queryData = fs.readFileSync(path.join(filePath, 'riskQueries.json'))
  const rsData = fs.readFileSync(path.join(filePath, 'riversSeaDepth.json'))
  const swData = fs.readFileSync(path.join(filePath, 'surfaceWaterDepth.json'))
  riskQueries = JSON.parse(queryData)
  riversSeaDepthQueries = JSON.parse(rsData)
  surfaceWatchDepthQueries = JSON.parse(swData)
  riskQueriesLoaded = true
}

function processEsriResponse (response) {
  // check if response.json() is a function, if it's not, then we didn't use rawResponse: true
  if (typeof response.json !== 'function') {
    return Promise.resolve(response)
  }
  if (config.performanceLogging) {
    // We've got a response object that will have headers, we can dump those out here
    console.log('x-esri-query-request-units: %s', response.headers.get('x-esri-query-request-units'))
    console.log('x-esri-org-request-units-per-min: %s', response.headers.get('x-esri-org-request-units-per-min'))
    console.log('x-cache: %s', response.headers.get('x-cache'))
  }
  return Promise.resolve(response.json())
}

function logPerformance (result, query) {
  return new Promise((resolve, _reject) => {
    if (config.performanceLogging) {
      const perfData = {
        startTime: query.startTime,
        endTime: performance.now(),
        url: query.url,
        key: query.key
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
  const qRes = await Promise.all(queries.map(query => {
    if (config.performanceLogging) {
      query.startTime = performance.now()
    }
    if (query.esriCall) {
      return queryFeatures({
        url: query.url,
        geometry,
        geometryType,
        spatialRel,
        distance: 2,
        units: 'esriSRUnit_Meter',
        returnGeometry,
        authentication: appManager.token,
        outFields: query.outFields || undefined,
        rawResponse: true
      }).then((response) => { return processEsriResponse(response) })
        .then((result) => { return logPerformance(result, query) })
    } else {
      return riskData(query.url).then((result) => { return logPerformance(result, query) })
    }
  }))
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
        featureLayers[queries[index].key] = result.features
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

const riskQuery = async (x, y) => {
  const queries = []
  if (!riskQueriesLoaded) { loadRiskQueries() }
  riskQueries.forEach(query => {
    queries.push({
      esriCall: true,
      key: query.key,
      url: query.url,
      outfields: query.outfields
    })
  })
  queries.push({
    esriCall: false,
    key: 'extrainfo',
    url: `${config.riskDataUrl}/${x}/${y}`
  })

  return externalQueries(x, y, queries)
}

const depthQueries = async (x, y, dq) => {
  const queries = []
  dq.forEach(query => {
    queries.push({
      esriCall: true,
      key: query.key,
      url: query.url,
      outfields: query.outfields
    })
  })

  return externalQueries(x, y, queries)
}

const riversAndSeaDepth = async (x, y) => {
  if (!riskQueriesLoaded) { loadRiskQueries() }
  return depthQueries(x, y, riversSeaDepthQueries)
}

const surfaceWaterDepth = async (x, y) => {
  if (!riskQueriesLoaded) { loadRiskQueries() }
  return depthQueries(x, y, surfaceWatchDepthQueries)
}

module.exports = { riskQuery, riversAndSeaDepth, surfaceWaterDepth, _currentToken }
