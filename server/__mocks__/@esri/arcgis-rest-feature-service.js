const addressData = require('./mock-address-data')
const reservoirsDryDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/0'
const reservoirsWetDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/1'
const floodAlertAreasDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/2'
const floodWarningAreasDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/3'
const llfaDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/4'
const riversAndSeaDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Rivers_and_Sea_Depth/FeatureServer/0'
const surfaceWaterDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Surface_Water_Depth__0mm/FeatureServer/0'

const queryFeatures = ({ url, geometry, geometryType, spatialRel, returnGeometry, authentication, _outFields }) => {
  // check other data (geometry type, spatial relation, return geometry)
  checkOtherArgumentValues(geometryType, spatialRel, returnGeometry)
  // check authentication
  checkCredentials(authentication)

  const urlToDataMap = {
    [reservoirsDryDataUrl]: {
      objectIdFieldName: 'Dry reservoirs',
      featureKey: 'dryReservoirs'
    },
    [reservoirsWetDataUrl]: {
      objectIdFieldName: 'Wet reservoirs',
      featureKey: 'wetReservoirs'
    },
    [floodAlertAreasDataUrl]: {
      objectIdFieldName: 'Flood alert',
      featureKey: 'floodAlertAreas'
    },
    [floodWarningAreasDataUrl]: {
      objectIdFieldName: 'Flood warning',
      featureKey: 'floodWarningAreas'
    },
    [llfaDataUrl]: {
      objectIdFieldName: 'LLFA',
      featureKey: 'llfa'
    },
    [riversAndSeaDataUrl]: {
      objectIdFieldName: 'Rivers and the sea',
      featureKey: 'riversAndSea',
      isArray: true
    },
    [surfaceWaterDataUrl]: {
      objectIdFieldName: 'Surface Water',
      featureKey: 'surfaceWater',
      isArray: true
    }
  }

  if (urlToDataMap[url]) {
    const { objectIdFieldName, featureKey, isArray } = urlToDataMap[url]
    const locationData = addressData[0][geometry.x][geometry.y]
    return {
      objectIdFieldName,
      uniqueIdField: { name: 'OBJECTID', isSystemMaintained: true },
      globalIdFieldName: '',
      geometryProperties: {
        shapeAreaFieldName: 'Shape__Area',
        shapeLengthFieldName: 'Shape__Length',
        units: 'esriMeters'
      },
      features: isArray ? [locationData[featureKey][0]] : locationData[featureKey]
    }
  }

  console.log('Issue inside query feature mock')
}

const checkCredentials = (authentication) => {
  const storedToken = '1234abcd'
  const authenticated = authentication === storedToken

  return authenticated
}

const checkOtherArgumentValues = (geometryType, spatialRel, returnGeometry) => {
  geometryType === 'esriGeometryPoint' ? console.log('correct type') : console.log('wrong type')
  spatialRel === 'esriSpatialRelIntersects' ? console.log('correct spatial') : console.log('wrong spatial')
  returnGeometry === 'false' ? console.log('correct returnGeometry') : console.log('returnGeometry should be true')
}

module.exports = { queryFeatures }
