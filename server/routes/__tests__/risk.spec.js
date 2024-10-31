const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
const riskQuery = require('../../services/riskQuery')
const testData = require('./__test_data__/')
const options = {
  method: 'GET',
  url: '/floodrisk/564228/263339/20'
}

jest.mock('@esri/arcgis-rest-feature-service')
jest.mock('@esri/arcgis-rest-request')
jest.mock('../../services/riskQuery')
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
    riskQuery._queryResult(testData.getEmptyData())

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/floodrisk/{x}/{y}/{radius} - No db result', async () => {
    riskQuery._queryResult(undefined)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST)
  })

  test('/floodrisk/{x}/{y}/{radius} - Valid db result', async () => {
    riskQuery._queryResult(testData.getValidData())

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/floodrisk/{x}/{y}/{radius} - Exception raised during call', async () => {
    riskQuery.riskQuery.mockImplementationOnce(() => {
      return Promise.reject(new Error('Issue with Promise.all call: Mock error'))
    })

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_INTERNAL_SERVER_ERROR)
  })

  test('/floodrisk/{x}/{y}/{radius} - Empty Groundwater alert result', async () => {
    const inputData = testData.getValidData()
    // Clear out the warning data
    inputData.floodWarningAreas = null
    riskQuery._queryResult(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/floodrisk/{x}/{y}/{radius} - Empty Groundwater warning result', async () => {
    const inputData = testData.getValidData()
    // Clear out the alert data
    inputData.floodAlertAreas = null
    riskQuery._queryResult(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/floodrisk/{x}/{y}/{radius} - Groundwater alert result', async () => {
    const inputData = testData.getValidData()
    inputData.floodAlertAreas[0].attributes.FWS_TACODE = '033WAG204'
    riskQuery._queryResult(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/floodrisk/{x}/{y}/{radius} - Groundwater warning result', async () => {
    const inputData = testData.getValidData()
    inputData.floodWarningAreas[0].attributes.FWS_TACODE = '033WAG204'
    riskQuery._queryResult(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/floodrisk/{x}/{y}/{radius} - Extra info error', async () => {
    const inputData = testData.getValidData()
    inputData.extrainfo = 'Error'
    riskQuery._queryResult(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/floodrisk/{x}/{y}/{radius} - Extra info result', async () => {
    const inputData = testData.getValidData()
    // The extra info contains a surface water override that will change the High to Low
    inputData.extrainfo = testData.getExtraInfo()
    riskQuery._queryResult(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.payload).toMatch('"surfaceWaterRisk":"Low"')
  })

  test('/floodrisk/{x}/{y}/{radius} - riverAndSeaRisk with valid Risk_band', async () => {
    const inputData = testData.getValidData()
    inputData.riversAndSea = [
      {
        attributes: {
          Risk_band: 'Very Low'
        }
      }
    ]

    riskQuery._queryResult(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.payload).toMatch('"probabilityForBand":"Very Low"')
  })
})
