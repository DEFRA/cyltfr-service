const addressData = [{
  564228: {
    263339: {
      wetReservoirs: [],
      dryReservoirs: [],
      riversAndSea: [{
        attributes: {
          OBJECTID: 38063,
          Label: 'High ****',
          Risk_band: 'High',
          Confidence: 4,
          Shape__Area: 136876,
          Shape__Length: 8084
        }
      }],
      surfaceWater: [{
        attributes: {
          OBJECTID: 212275,
          Label: 'High ****',
          Risk_band: 'High',
          Confidence: 4,
          Shape__Area: 17836,
          Shape__Length: 12820
        }
      }]
    }
  },
  562372: {
    132869: {
      wetReservoirs: [],
      dryReservoirs: [],
      riversAndSea: [],
      surfaceWater: []
    }
  },
  460121: {
    431744: {
      wetReservoirs: [
        {
          attributes: {
            OBJECTID: 438,
            RESERVOIR: 'Eccup',
            NGR: 'SE3040041700',
            LLFA_NAME: 'Leeds',
            UNDERTAKER: 'Yorkshire Water Services Ltd',
            RISK_DESIGNATION: 'High-risk',
            COMMENTS: 'If you have questions about local emergency plans for this reservoir you should contact the named Local Authority',
            ORIG_FID: 438,
            Shape__Area: 446481872,
            Shape__Length: 3336136
          }
        },
        {
          attributes: {
            OBJECTID: 487,
            RESERVOIR: 'Fewston',
            NGR: 'SE1870054100',
            LLFA_NAME: 'North Yorkshire',
            UNDERTAKER: 'Yorkshire Water Services Ltd',
            RISK_DESIGNATION: 'High-risk',
            COMMENTS: 'If you have questions about local emergency plans for this reservoir you should contact the named Local Authority',
            ORIG_FID: 487,
            Shape__Area: 438503456.25,
            Shape__Length: 3413035
          }
        },
        {
          attributes: {
            OBJECTID: 1418,
            RESERVOIR: 'Thruscross',
            NGR: 'SE1520057800',
            LLFA_NAME: 'North Yorkshire',
            UNDERTAKER: 'Yorkshire Water Services Ltd',
            RISK_DESIGNATION: 'High-risk',
            COMMENTS: 'If you have questions about local emergency plans for this reservoir you should contact the named Local Authority',
            ORIG_FID: 1418,
            Shape__Area: 456701781.25,
            Shape__Length: 3590905
          }
        }
      ],
      dryReservoirs: [{
        attributes: {
          OBJECTID: 834,
          RESERVOIR: 'Lindley Wood',
          NGR: 'SE2150049300',
          LLFA_NAME: 'North Yorkshire',
          UNDERTAKER: 'Yorkshire Water Services Ltd',
          RISK_DESIGNATION: 'High-risk',
          COMMENTS: 'If you have questions about local emergency plans for this reservoir you should contact the named Local Authority',
          ORIG_FID: 834,
          Shape__Area: 299216772,
          Shape__Length: 2178732
        }
      }
      ],
      riversAndSea: [{
        attributes: {
          OBJECTID: 38065,
          Label: 'Medium **',
          Risk_band: 'Medium',
          Confidence: 2,
          Shape__Area: 127436,
          Shape__Length: 5001
        }
      }],
      surfaceWater: []
    }
  }
}]

const queryFeatures = ({ url, geometry, geometryType, spatialRel, returnGeometry, authentication, outFields }) => {
  const reservoirsDryDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/0'
  const reservoirsWetDataUrl = 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/check_long_term_flood_risk_service/FeatureServer/1'
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
    console.log('geometry.x: ', geometry.x)
    console.log('geometry.y: ', geometry.y)
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
  if (url === riversAndSeaDataUrl) {
    // find location using geometry
    const locationData = addressData[0][geometry.x][geometry.y]
    // console.log(locationData)
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
