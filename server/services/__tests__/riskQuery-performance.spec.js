import { dataConfig } from '../../config.js'
import { riskQuery } from '../riskQuery.js'

jest.mock('../../config')
jest.mock('node-fetch')
jest.mock('@esri/arcgis-rest-request')

beforeAll(async () => {
  dataConfig.setConfigOptions({ performanceLogging: true })
})

afterAll(async () => {
  dataConfig.setConfigOptions({ performanceLogging: true })
})

describe('riskQuery', () => {
  let x, y

  describe('Queries with performance logging', () => {
    dataConfig.setConfigOptions({ performanceLogging: true })

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
