const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')
const { queryFeatures } = require('@esri/arcgis-rest-feature-service')
const { riskData } = require('./riskData')
const config = require('../config')
const riskQueries = require('./riskQueries')
const riversSeaDepthQueries = require('./riversSeaDepth')
const surfaceWatchDepthQueries = require('./surfaceWaterDepth')

const appManager = ApplicationCredentialsManager.fromCredentials({
  clientId: config.esriClientId,
  clientSecret: config.esriClientSecret
})

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
    const results = await Promise.all(queries.map(query => {
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

  return await externalQueries(x, y, queries)
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

  return await externalQueries(x, y, queries)
}

const riversAndSeaDepth = async (x, y) => {
  return depthQueries(x, y, riversSeaDepthQueries)
}

const surfaceWaterDepth = async (x, y) => {
  return depthQueries(x, y, surfaceWatchDepthQueries)
}

module.exports = { riskQuery, riversAndSeaDepth, surfaceWaterDepth }
