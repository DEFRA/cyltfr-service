const LLFA_NAME = 'North Yorkshire'
const UNDERTAKER = 'Yorkshire Water Services Ltd'
const COMMENTS = 'If you have questions about local emergency plans for this reservoir you should contact the named Local Authority'

module.exports = [{
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
      }],
      floodAlertAreas: [
        {
          attributes: {
            OBJECTID: 553,
            AREA: 'Lincs and Northants',
            FWS_TACODE: '053FAG100BUH',
            TA_NAME: 'Groundwater flooding south of the Humber Estuary',
            DESCRIP: 'Groundwater Flooding in the area around Barrow upon Humber and Barton Upon Humber',
            LA_NAME: 'North Lincolnshire',
            QDIAL: '207000',
            RIVER_SEA: 'Groundwater',
            Shape__Area: 987880,
            Shape__Length: 6811.902892555959
          }
        }
      ],
      floodWarningAreas: [
        {
          attributes: {
            OBJECTID: 730,
            AREA: 'Lincs and Northants',
            FWS_TACODE: '053FWGBUH1',
            TA_NAME: 'Groundwater flooding in Barrow Upon Humber and Barton Upon Humber',
            DESCRIP: 'Groundwater flooding in Barrow and Barton Upon Humber including Orchard Close, Westoby Lane, Park View Close, Feather Lane and Wolsey Drive, Wrens Kitchen and properties on the Humber Bridge Industrial estate',
            LA_NAME: 'North Lincolnshire',
            PARENT: '053FAG100BUH',
            QDIAL: '307054',
            RIVER_SEA: 'Groundwater',
            Shape__Area: 987880,
            Shape__Length: 6811.902892555959
          }
        }
      ],
      llfa: [{
        attributes: {
          name: 'A council'
        }
      }]
    }
  },
  562372: {
    132869: {
      wetReservoirs: [],
      dryReservoirs: [],
      riversAndSea: [],
      surfaceWater: [],
      floodAlertAreas: [],
      floodWarningAreas: [],
      llfa: [{
        attributes: {
          name: 'A council'
        }
      }]
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
            UNDERTAKER,
            RISK_DESIGNATION: 'High-risk',
            COMMENTS,
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
            LLFA_NAME,
            UNDERTAKER,
            RISK_DESIGNATION: 'High-risk',
            COMMENTS,
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
            LLFA_NAME,
            UNDERTAKER,
            RISK_DESIGNATION: 'High-risk',
            COMMENTS,
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
          LLFA_NAME,
          UNDERTAKER,
          RISK_DESIGNATION: 'High-risk',
          COMMENTS,
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
      surfaceWater: [],
      floodAlertAreas: [],
      floodWarningAreas: [],
      llfa: [{
        attributes: {
          name: 'A council'
        }
      }]
    }
  }
}]
