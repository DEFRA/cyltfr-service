const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')
const { queryFeatures } = require('@esri/arcgis-rest-feature-service')
const config = require('../config')

const appManager = ApplicationCredentialsManager.fromCredentials({
  clientId: config.esriClientId,
  clientSecret: config.esriClientSecret
})

const layer = {
  wetReservoirsLayer: 1,
  dryReservoirsLayer: 0,
  floodAlertAreasLayer: 2,
  surfaceWaterLayer: 0,
  riversAndSeaLayer: 0
}

const riskQuery = async (x, y) => {
  const featureLayers = {}
  const manager = await appManager.refreshToken()
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
  const outFields = 'Risk_band' // used to specify property wanted

  const queries = [
    {
      key: 'wetReservoirs',
      url: `https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/${layer.wetReservoirsLayer}`
    },
    {
      key: 'dryReservoirs',
      url: `https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/${layer.dryReservoirsLayer}`
    },
    {
      key: 'floodAlertAreas',
      url: `https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/${layer.floodAlertAreasLayer}`
    },
    {
      key: 'riversAndSea',
      url: `https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Rivers_and_Sea_Depth/FeatureServer/${layer.riversAndSeaLayer}`,
      outFields
    },
    {
      key: 'surfaceWater',
      url: `https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Surface_Water_Depth__0mm/FeatureServer/${layer.surfaceWaterLayer}`,
      outFields
    }
  ]

  try {
    const results = await Promise.all(queries.map(query =>
      queryFeatures({
        url: query.url,
        geometry,
        geometryType,
        spatialRel,
        returnGeometry,
        authentication: manager,
        outFields: query.outFields || undefined
      })
    ))
    results.forEach((result, index) => {
      featureLayers[queries[index].key] = result.features
    })

    return featureLayers
  } catch (err) {
    console.log('Risk query error: ', err)
  }
}

module.exports = { riskQuery }
