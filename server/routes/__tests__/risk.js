const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
const db = require('../../db')
const testData = require('./__test_data__/')
const options = {
  method: 'GET',
  url: '/floodrisk/391416/102196/20'
}

jest.mock('../../db')
let server

describe('Unit tests - /floodrisk', () => {
  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  test('Normal get returns the payload', async () => {
    const inputData = testData.getEmptyData()
    db._queryResult(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/floodrisk/{x}/{y}/{radius} - Throws db error', async () => {
    db.query.mockImplementationOnce(() => { throw new Error('Mock Error') })
    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST)
  })

  test('/floodrisk/{x}/{y}/{radius} - No db result', async () => {
    db._queryResult([])

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST)
  })

  test('/floodrisk/{x}/{y}/{radius} - Valid db result', async () => {
    const inputData = testData.getValidData()
    db._queryResult(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/floodrisk/{x}/{y}/{radius} - Invalid db result', async () => {
    db._queryResult([{ error_result: '' }])

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST)
  })

  test('/floodrisk/{x}/{y}/{radius} - Groundwater alert result', async () => {
    const inputData = testData.getValidData()
    // Clear out the warning data
    inputData[0].calculate_flood_risk.flood_warning_area = null
    db._queryResult(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/floodrisk/{x}/{y}/{radius} - Groundwater warning result', async () => {
    const inputData = testData.getValidData()
    // Clear out the alert data
    inputData[0].calculate_flood_risk.flood_alert_area = null
    db._queryResult(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/floodrisk/{x}/{y}/{radius} - Groundwater area error', async () => {
    db._queryResult([
      {
        calculate_flood_risk: {
          in_england: true,
          flood_alert_area: 'Error',
          flood_warning_area: 'Error'
        }
      }
    ])

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/floodrisk/{x}/{y}/{radius} - Extra info error', async () => {
    const inputData = testData.getValidData()
    inputData[0].calculate_flood_risk.extra_info = 'Error'
    db._queryResult(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/floodrisk/{x}/{y}/{radius} - Extra info result', async () => {
    const inputData = testData.getValidData()
    // The extra info contains a surface water override that will change the High to Low
    inputData[0].calculate_flood_risk.extra_info = testData.getExtraInfo()
    db._queryResult(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.payload).toMatch('"surfaceWaterRisk":"Low"')
  })
})
