const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')
const { queryFeatures } = require('@esri/arcgis-rest-feature-service')
const config = require('../../config/server.json')

const appManager = ApplicationCredentialsManager.fromCredentials({
  clientId: config.esriClientId,
  clientSecret: config.esriClientSecret
})

const riskQuery = async (x, y) => {
  console.log('Inside the riskQuery')
  const manager = await appManager.refreshToken()
  console.log(x)
  const queryGeometry = {
    x,
    y,
    spatialReference: {
      wkid: 27000
    }
  }
  try {
    const queryResults = await queryFeatures({
      url: 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/1',
      geometry: queryGeometry,
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      returnGeometry: 'false',
      authentication: manager
    })
    return queryResults.features
  } catch (err) {
    console.log(err)
  }
}

module.exports = { riskQuery }
