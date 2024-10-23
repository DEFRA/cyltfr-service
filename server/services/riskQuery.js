const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')
const { queryFeatures } = require('@esri/arcgis-rest-feature-service')
const { riskData } = require('./riskData')
const config = require('../config')
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

const appManager = ApplicationCredentialsManager.fromCredentials({
  clientId: config.esriClientId,
  clientSecret: config.esriClientSecret
})

async function _currentToken () {
  return appManager.token
}

async function externalQueries (x, y, queries) {
  let esriToken = appManager.token
  if ((!esriToken) || (appManager.expires < Date.now())) {
    esriToken = await appManager.refreshToken()
  }
  const featureLayers = {}

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

  try {
    const runQueries = async () => {
      const qRes = await Promise.all(queries.map(query => {
        if (query.esriCall) {
          return queryFeatures({
            url: query.url,
            geometry,
            geometryType,
            spatialRel,
            returnGeometry,
            authentication: esriToken,
            outFields: query.outFields || undefined
          })
        } else {
          return riskData(query.url)
        }
      }))
      return qRes
    }
    let results
    try {
      results = await runQueries()
    } catch (err) {
      if (err.message === '498: Invalid token.') {
        esriToken = await appManager.refreshToken()
        results = await runQueries()
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
    })
  } catch (err) {
    throw new Error(`Issue with Promise.all call: ${err.message}`)
  }
  return featureLayers
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
