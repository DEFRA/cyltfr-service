jest.mock('../../config')
jest.mock('node-fetch')
jest.mock('@esri/arcgis-rest-feature-service')
jest.mock('@esri/arcgis-rest-request')
const config = require('../../config')

beforeAll(async () => {
  config.setConfigOptions({ performanceLogging: true })
})

afterAll(async () => {
  config.setConfigOptions({ performanceLogging: true })
})

describe('riskQuery', () => {
  let x, y

  describe('Queries with performance logging', () => {
    config.setConfigOptions({ performanceLogging: true })
    const { riskQuery } = require('../riskQuery')
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
  })
})
