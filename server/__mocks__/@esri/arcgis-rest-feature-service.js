const addressData = require('./mock-address-data')

const queryFeatures = ({ url, geometry, geometryType, spatialRel, returnGeometry, authentication, outFields }) => {
  const reservoirsDryDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/0'
  const reservoirsWetDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/1'
  const floodAlertAreasDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/2'
  const riversAndSeaDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Rivers_and_Sea_Depth/FeatureServer/0'
  const surfaceWaterDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Surface_Water_Depth__0mm/FeatureServer/0'
  // check other data (geometry type, spatial relation, return geometry)
  geometryType === 'esriGeometryPoint' ? console.log('correct type') : console.log('wrong type')
  spatialRel === 'esriSpatialRelIntersects' ? console.log('correct spatial') : console.log('wrong spatial')
  returnGeometry === 'false' ? console.log('correct returnGeometry') : console.log('returnGeometry should be true')
  // check authentication
  checkCredentials(authentication)

  if (url === reservoirsDryDataUrl) {
    // find location using geometry
    const locationData = addressData[0][geometry.x][geometry.y]
    return {
      objectIdFieldName: 'Dry rservoirs',
      uniqueIdField: { name: 'OBJECTID', isSystemMaintained: true },
      globalIdFieldName: '',
      geometryProperties: {
        shapeAreaFieldName: 'Shape__Area',
        shapeLengthFieldName: 'Shape__Length',
        units: 'esriMeters'
      },
      features: locationData.dryReservoirs
    }
  }
  if (url === reservoirsWetDataUrl) {
    // find location using geometry
    const locationData = addressData[0][geometry.x][geometry.y]
    return {
      objectIdFieldName: 'Wet reservoirs',
      uniqueIdField: { name: 'OBJECTID', isSystemMaintained: true },
      globalIdFieldName: '',
      geometryProperties: {
        shapeAreaFieldName: 'Shape__Area',
        shapeLengthFieldName: 'Shape__Length',
        units: 'esriMeters'
      },
      features: locationData.wetReservoirs
    }
  }
  if (url === floodAlertAreasDataUrl) {
    // find location using geometry
    const locationData = addressData[0][geometry.x][geometry.y]
    return {
      objectIdFieldName: 'Flood alert',
      uniqueIdField: { name: 'OBJECTID', isSystemMaintained: true },
      globalIdFieldName: '',
      geometryProperties: {
        shapeAreaFieldName: 'Shape__Area',
        shapeLengthFieldName: 'Shape__Length',
        units: 'esriMeters'
      },
      features: locationData.floodAlertAreas
    }
  }
  if (url === riversAndSeaDataUrl) {
    // find location using geometry
    const locationData = addressData[0][geometry.x][geometry.y]
    return {
      objectIdFieldName: 'Rivers and the sea',
      uniqueIdField: { name: 'OBJECTID', isSystemMaintained: true },
      globalIdFieldName: '',
      geometryProperties: {
        shapeAreaFieldName: 'Shape__Area',
        shapeLengthFieldName: 'Shape__Length',
        units: 'esriMeters'
      },
      features: [locationData.riversAndSea[0]]
    }
  }
  if (url === surfaceWaterDataUrl) {
    // find location using geometry
    const locationData = addressData[0][geometry.x][geometry.y]
    return {
      objectIdFieldName: 'Surface Water',
      uniqueIdField: { name: 'OBJECTID', isSystemMaintained: true },
      globalIdFieldName: '',
      geometryProperties: {
        shapeAreaFieldName: 'Shape__Area',
        shapeLengthFieldName: 'Shape__Length',
        units: 'esriMeters'
      },
      features: [locationData.surfaceWater[0]]
    }
  } else {
    console.log('URL pprovided may be incorrect')
  }
  // check output field wanted
  // if (outFields) {
  //   console.log('outfields: ', locationData.riversAndSea[0].attributes)
  //   return locationData.riversAndSea[0].attributes
  // }
}

const checkCredentials = (authentication) => {
  const storedToken = '1234abcd'
  const authenticated = authentication === storedToken

  return authenticated
}

module.exports = { queryFeatures }
