const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')
const { queryFeatures } = require('@esri/arcgis-rest-feature-service')
const { riskData } = require('./riskData')
const { performance } = require('node:perf_hooks')
const config = require('../config')

const appManager = ApplicationCredentialsManager.fromCredentials({
  clientId: config.esriClientId,
  clientSecret: config.esriClientSecret
})
const layer = {
  wetReservoirsLayer: 1,
  dryReservoirsLayer: 0,
  floodAlertAreasLayer: 2,
  floodWarningAreasLayer: 3,
  llfaLayer: 4,
  surfaceWaterLayer: 0,
  riversAndSeaLayer: 0
}

const outFields = 'Risk_band' // used to specify property wanted
const esriQueries = [
  {
    esriCall: true,
    key: 'dryReservoirs',
    url: `https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/${layer.dryReservoirsLayer}`
  },
  {
    esriCall: true,
    key: 'wetReservoirs',
    url: `https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/${layer.wetReservoirsLayer}`
  },
  {
    esriCall: true,
    key: 'floodAlertAreas',
    url: `https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/${layer.floodAlertAreasLayer}`
  },
  {
    esriCall: true,
    key: 'floodWarningAreas',
    url: `https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/${layer.floodWarningAreasLayer}`
  },
  {
    esriCall: true,
    key: 'llfa',
    url: `https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/${layer.llfaLayer}`
  },
  {
    esriCall: true,
    key: 'riversAndSea',
    url: `https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Rivers_and_Sea_Depth/FeatureServer/${layer.riversAndSeaLayer}`,
    outFields
  },
  {
    esriCall: true,
    key: 'surfaceWater',
    url: `https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Surface_Water_Depth__0mm/FeatureServer/${layer.surfaceWaterLayer}`,
    outFields
  }
]

const riskQuery = async (x, y) => {
  const featureLayers = {}
  const tokenStartTime = performance.now()
  let esriToken = appManager.token
  if ((!esriToken) || (appManager.expires < Date.now())) {
    esriToken = await appManager.refreshToken()
  }
  const allPerfData = []
  const tokenRefreshTime = performance.now() - tokenStartTime
  const queries = []
  esriQueries.forEach(query => {
    queries.push({
      esriCall: true,
      key: query.key,
      url: query.url,
      outfields: query.outfields,
      startTime: performance.now(),
      endTime: 0
    })
  })
  queries.push({
    esriCall: false,
    key: 'extrainfo',
    url: `${config.riskDataUrl}/${x}/${y}`,
    startTime: performance.now(),
    endTime: 0
  })
  const geometry = {
    x,
    y,
    spatialReference: {
      wkid: 27000
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
        }).then((result) => {
          return new Promise((resolve, reject) => {
            const retval = { ...result }
            const perfData = {}
            perfData.startTime = query.startTime
            perfData.endTime = performance.now()
            perfData.timeTaken = perfData.endTime - perfData.startTime
            perfData.url = query.url
            perfData.key = query.key
            allPerfData.push(perfData)
            resolve(retval)
          })
        })
      } else {
        return riskData(query.url).then(
          (result) => {
            return new Promise((resolve, reject) => {
              const retval = { ...result }
              const perfData = {}
              perfData.startTime = query.startTime
              perfData.endTime = performance.now()
              perfData.timeTaken = perfData.endTime - perfData.startTime
              perfData.url = query.url
              perfData.key = query.key
              allPerfData.push(perfData)
              resolve(retval)
            })
          })
      }
    }))
    results.forEach((result, index) => {
      if (queries[index].esriCall) {
        featureLayers[queries[index].key] = result.features
      } else {
        featureLayers[queries[index].key] = result
      }
    })
    console.log(JSON.stringify(allPerfData))
    // console.log('Token refresh time : %d', tokenRefreshTime)
  } catch (err) {
    throw new Error(`Issue with Promise.all call: ${err.message}`)
  }
  return featureLayers
}

module.exports = { riskQuery }
