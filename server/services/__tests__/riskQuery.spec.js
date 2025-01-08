const { riskQuery, riversAndSeaDepth, surfaceWaterDepth, reservoirQuery, _currentToken } = require('../riskQuery')
jest.mock('../../config')
jest.mock('node-fetch')
jest.mock('@esri/arcgis-rest-request')
const config = require('../../config')

beforeAll(async () => {
  config.setConfigOptions({ performanceLogging: false })
})

afterAll(async () => {
  config.setConfigOptions({ performanceLogging: false })
})

describe('riskQuery', () => {
  let x, y

  describe('should return an object with feature layers which has', () => {
    test('High risk of rivers and the sea and surface water, no reservoirs, flood alert and warning', async () => {
      [x, y] = [564228, 263339]
      const result = await riskQuery(x, y)
      expect(result).toEqual(expect.objectContaining(returnedQuery))
    })
    test('High risk of rivers and the sea and surface water, no reservoirs, flood alert and warning, no llfa', async () => {
      [x, y] = [564228, 263338]
      await expect(riskQuery(x, y)).rejects.toThrow('Issue with Promise.all call: Invalid response for llfa')
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

  describe('if API call fails', () => {
    const { request } = require('@esri/arcgis-rest-request')

    it('should throw an error when arcgis request call breaks', async () => {
      [x, y] = [123, 456]
      request.mockImplementationOnce(() => {
        throw new Error('Mock request error')
      })

      await expect(riskQuery(x, y)).rejects.toThrow('Issue with Promise.all call: Mock request error')
    })
  })

  describe('API call fails', () => {
    const { request } = require('@esri/arcgis-rest-request')

    it('should refresh the token when an Invalid token error occurs', async () => {
      [x, y] = [460121, 431744]
      const oldToken = await _currentToken()
      request.mockImplementationOnce(() => {
        return Promise.reject(new Error('498: Invalid token.'))
      })
      const result = await riskQuery(x, y)
      expect(result).toEqual(expect.objectContaining({
        wetReservoirs: reservoirs.wet,
        dryReservoirs: reservoirs.dry,
        riversAndSea: [{ attributes: { Confidence: 2, Label: 'Medium **', OBJECTID: 38065, Risk_band: 'Medium', Shape__Area: 127436, Shape__Length: 5001 } }],
        surfaceWater: []
      }))

      await expect(oldToken).not.toEqual(await _currentToken())
    })

    it('should retry when a 503 error occurs', async () => {
      [x, y] = [460121, 431744]
      request.mockImplementationOnce(() => {
        return Promise.reject(new Error('503: Invalid query parameters.'))
      })
      const result = await riskQuery(x, y)
      expect(result).toEqual(expect.objectContaining({
        wetReservoirs: reservoirs.wet,
        dryReservoirs: reservoirs.dry,
        riversAndSea: [{ attributes: { Confidence: 2, Label: 'Medium **', OBJECTID: 38065, Risk_band: 'Medium', Shape__Area: 127436, Shape__Length: 5001 } }],
        surfaceWater: []
      }))
    })
  })

  describe('Depth queries', () => {
    test('a Rivers and Sea Depth result', async () => {
      [x, y] = [400000, 500000]
      const result = await riversAndSeaDepth(x, y)
      expect(result).toMatchObject(rsDepthQuery)
    })
    test('a surface water Depth result', async () => {
      [x, y] = [400000, 500000]
      const result = await surfaceWaterDepth(x, y)
      expect(result).toMatchObject(swDepthQuery)
    })
  })

  describe('Reservoir queries', () => {
    test('a reservoir query', async () => {
      [x, y] = [460121, 431744]
      const result = await reservoirQuery(x, y)
      expect(result).toEqual(expect.objectContaining({
        wetReservoirs: reservoirs.wet,
        dryReservoirs: reservoirs.dry
      }))
    })
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

const rsDepthQuery = {
  riversAndSeaDepth200mm: [
    {
      attributes: {
        Risk_band: 'High'
      }
    }
  ],
  riversAndSeaDepth300mm: [
    {
      attributes: {
        Risk_band: 'High'
      }
    }
  ],
  riversAndSeaDepth600mm: [
    {
      attributes: {
        Risk_band: 'High'
      }
    }
  ],
  riversAndSeaCCDepth200mm: [
    {
      attributes: {
        Risk_band: 'High'
      }
    }
  ],
  riversAndSeaCCDepth300mm: [
    {
      attributes: {
        Risk_band: 'High'
      }
    }
  ],
  riversAndSeaCCDepth600mm: [
    {
      attributes: {
        Risk_band: 'High'
      }
    }
  ]

}

const swDepthQuery = {
  surfaceWaterDepth200mm: [
    {
      attributes: {
        Risk_band: 'High'
      }
    }
  ],
  surfaceWaterDepth300mm: [
    {
      attributes: {
        Risk_band: 'High'
      }
    }
  ],
  surfaceWaterDepth600mm: [
    {
      attributes: {
        Risk_band: 'High'
      }
    }
  ],
  surfaceWaterCCDepth200mm: [
    {
      attributes: {
        Risk_band: 'High'
      }
    }
  ],
  surfaceWaterCCDepth300mm: [
    {
      attributes: {
        Risk_band: 'High'
      }
    }
  ],
  surfaceWaterCCDepth600mm: [
    {
      attributes: {
        Risk_band: 'High'
      }
    }
  ]

}

const returnedQuery = {
  wetReservoirs: [],
  dryReservoirs: [],
  riversAndSea: [{ attributes: { Confidence: 4, Label: 'High ****', OBJECTID: 38063, Risk_band: 'High', Shape__Area: 136876, Shape__Length: 8084 } }],
  surfaceWater: [{ attributes: { Confidence: 4, Label: 'High ****', OBJECTID: 212275, Risk_band: 'High', Shape__Area: 17836, Shape__Length: 12820 } }],
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
