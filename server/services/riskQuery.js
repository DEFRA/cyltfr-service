const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')
const { queryFeatures } = require('@esri/arcgis-rest-feature-service')
const config = require('../../config/server.json')

const appManager = ApplicationCredentialsManager.fromCredentials({
  clientId: config.esriClientId,
  clientSecret: config.esriClientSecret
})

const riskQuery = async (x, y) => {
  const featureLayers = {}
  const manager = await appManager.refreshToken()
  const queryGeometry = {
    x,
    y,
    spatialReference: {
      wkid: 27000
    }
  }

  console.log(queryGeometry)
  try {
    const wetReservoirs = await queryFeatures({
      url: 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/1',
      geometry: queryGeometry,
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      returnGeometry: 'false',
      authentication: manager
    })
    featureLayers.wetReservoirs = wetReservoirs.features

    const dryReservoirs = await queryFeatures({
      url: 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/0',
      geometry: queryGeometry,
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      returnGeometry: 'false',
      authentication: manager
    })
    featureLayers.dryReservoirs = dryReservoirs.features

    const riversAndSea = await queryFeatures({
      url: 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Rivers_and_Sea_Depth/FeatureServer/0',
      geometry: queryGeometry,
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      returnGeometry: 'false',
      authentication: manager
    })
    featureLayers.riversAndSea = riversAndSea.features

    const surfaceWater = await queryFeatures({
      url: 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Surface_Water_Depth__0mm/FeatureServer/0',
      geometry: queryGeometry,
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      returnGeometry: 'false',
      authentication: manager,
      outFields: 'Risk_band'
    })
    featureLayers.surfaceWater = surfaceWater.features

    return featureLayers
  } catch (err) {
    console.log(err)
  }
}

module.exports = { riskQuery }
