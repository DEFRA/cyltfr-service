const { riskQuery } = require('../riskQuery')

jest.mock('@esri/arcgis-rest-feature-service')
jest.mock('@esri/arcgis-rest-request')

describe('riskQuery > should return an object with feature layers which has', () => {
  let x, y

  test('High risk of rivers and the sea and surface water, no reservoirs', async () => {
    [x, y] = [564228, 263339]
    const result = await riskQuery(x, y)
    expect(result).toEqual(expect.objectContaining({
      wetReservoirs: [],
      dryReservoirs: [],
      riversAndSea: [{ attributes: { Confidence: 4, Label: 'High ****', OBJECTID: 38063, Risk_band: 'High', Shape__Area: 136876, Shape__Length: 8084 } }],
      surfaceWater: [{ attributes: { Confidence: 4, Label: 'High ****', OBJECTID: 212275, Risk_band: 'High', Shape__Area: 17836, Shape__Length: 12820 } }]
    }))
  })

  test('Very low risk of rivers and the sea and surface water, no reservoirs should be empty arrays', async () => {
    [x, y] = [562372, 132869]
    const result = await riskQuery(x, y)
    expect(result).toEqual(expect.objectContaining({
      wetReservoirs: [],
      dryReservoirs: [],
      riversAndSea: [],
      surfaceWater: []
    }))
  })

  test('Medium risk of rivers the sea, very low risk surface water, wet reservoirs', async () => {
    [x, y] = [460121, 431744]
    const result = await riskQuery(x, y)
    expect(result).toEqual(expect.objectContaining({
      wetReservoirs: reservoirs.wet,
      dryReservoirs: reservoirs.dry,
      riversAndSea: [{ attributes: { Confidence: 2, Label: 'Medium **', OBJECTID: 38065, Risk_band: 'Medium', Shape__Area: 127436, Shape__Length: 5001 } }],
      surfaceWater: []
    }))
  })
})

const reservoirs = {
  wet: [
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
  dry: [{
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
  ]
}