class ApplicationCredentialsManager {
  #tokenCount = 0
  correctId
  correctSecret
  token
  expires
  portal
  duration
  _pendingTokenRequest

  constructor (clientId, clientSecret) {
    this.#tokenCount = 0
    this.correctId = clientId === '12345' ? '12345' : 'failed'
    this.correctSecret = clientSecret === 'abc123' ? 'abc123' : 'failed'
    this.token = ''
    this.expires = '2024-07-23T14:22:45.048Z'
    this.portal = 'https://www.arcgis.com/sharing/rest'
    this.duration = 7200
    this._pendingTokenRequest = null
  }

  refreshToken () {
    this.#tokenCount++
    this.token = `1234abcd${this.#tokenCount}`
    return this.token
  }

  static fromCredentials ({ clientId, clientSecret }) {
    return new ApplicationCredentialsManager(clientId, clientSecret)
  }
}

const { appendCustomParams } = jest.requireActual('@esri/arcgis-rest-request')

const addressData = require('./mock-address-data')
const reservoirsDryDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/0'
const reservoirsWetDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/1'
const floodAlertAreasDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/2'
const floodWarningAreasDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/3'
const llfaDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/4'
const riversAndSeaDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Rivers_and_Sea_Depth/FeatureServer/0'
const surfaceWaterDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Surface_Water_Depth__0mm/FeatureServer/0'
const riversAndSeaCCDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/ArcGIS/rest/services/risk_of_flooding_from_rivers_and_sea_CCRS2_depth_properties/FeatureServer/0'
const surfaceWaterCCDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Surface_Water_CCSW3_Depth_0mm/FeatureServer/0'

const request = jest.fn((requesturl, requestObj) => {
  // check authentication
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
    },
    [riversAndSeaCCDataUrl]: {
      objectIdFieldName: 'Rivers and the sea CC',
      featureKey: 'riversAndSeaCC',
      isArray: true
    },
    [surfaceWaterCCDataUrl]: {
      objectIdFieldName: 'Surface Water CC',
      featureKey: 'surfaceWaterCC',
      isArray: true
    },
    'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Rivers_and_Sea_Depth/FeatureServer/1':
    {
      objectIdFieldName: 'riversAndSeaDepth200mm',
      featureKey: 'riversAndSeaDepth200mm'
    },
    'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Rivers_and_Sea_Depth/FeatureServer/2':
    {
      objectIdFieldName: 'riversAndSeaDepth300mm',
      featureKey: 'riversAndSeaDepth300mm'
    },
    'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Rivers_and_Sea_Depth/FeatureServer/3':
    {
      objectIdFieldName: 'riversAndSeaDepth600mm',
      featureKey: 'riversAndSeaDepth600mm'
    },
    'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/risk_of_flooding_from_rivers_and_sea_CCRS2_depth_properties/FeatureServer/1':
    {
      objectIdFieldName: 'riversAndSeaCCDepth200mm',
      featureKey: 'riversAndSeaCCDepth200mm'
    },
    'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/risk_of_flooding_from_rivers_and_sea_CCRS2_depth_properties/FeatureServer/2':
    {
      objectIdFieldName: 'riversAndSeaCCDepth300mm',
      featureKey: 'riversAndSeaCCDepth300mm'
    },
    'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/risk_of_flooding_from_rivers_and_sea_CCRS2_depth_properties/FeatureServer/3':
    {
      objectIdFieldName: 'riversAndSeaCCDepth600mm',
      featureKey: 'riversAndSeaCCDepth600mm'
    },

    'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Surface_Water_Depth__200mm/FeatureServer/0':
    {
      objectIdFieldName: 'surfaceWaterDepth200mm',
      featureKey: 'surfaceWaterDepth200mm'
    },
    'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Surface_Water_Depth__300mm/FeatureServer/0':
    {
      objectIdFieldName: 'surfaceWaterDepth300mm',
      featureKey: 'surfaceWaterDepth300mm'
    },
    'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Surface_Water_Depth__600mm/FeatureServer/0':
    {
      objectIdFieldName: 'surfaceWaterDepth600mm',
      featureKey: 'surfaceWaterDepth600mm'
    },
    'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Surface_Water_CCSW3_200mm/FeatureServer/0':
    {
      objectIdFieldName: 'surfaceWaterCCDepth200mm',
      featureKey: 'surfaceWaterCCDepth200mm'
    },
    'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Surface_Water_CCSW3_300mm/FeatureServer/0':
    {
      objectIdFieldName: 'surfaceWaterCCDepth300mm',
      featureKey: 'surfaceWaterCCDepth300mm'
    },
    'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Risk_of_Flooding_from_Surface_Water_CCSW3_600mm/FeatureServer/0':
    {
      objectIdFieldName: 'surfaceWaterCCDepth600mm',
      featureKey: 'surfaceWaterCCDepth600mm'
    }

  }

  if (urlToDataMap[requestObj.params.url]) {
    const { objectIdFieldName, featureKey, isArray } = urlToDataMap[requestObj.params.url]
    const locationData = addressData[0][requestObj.params.geometry.x][requestObj.params.geometry.y]
    return new Promise((resolve, _reject) => {
      const retVal = {
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
      retVal.headers = { get: () => '1;1' }
      retVal.json = () => retVal
      resolve(retVal)
    })
  }

  return new Promise((resolve, _reject) => { resolve({}) })
})

module.exports = { ApplicationCredentialsManager, appendCustomParams, request }
