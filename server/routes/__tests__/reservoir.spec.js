const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
const riskQuery = require('../../services/riskQuery')
const testData = require('./__test_data__/reservoir')
const options = {
  method: 'GET',
  url: '/reservoir/564228/263339'
}

jest.mock('../../config')
jest.mock('@esri/arcgis-rest-request')
jest.mock('../../services/riskQuery')
let server

describe('Unit tests - /reservoir', () => {
  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  test('Normal get returns the payload', async () => {
    riskQuery._resData(testData.getEmptyData())

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/reservoir/{x}/{y} - No db result', async () => {
    riskQuery._resData(undefined)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST)
  })

  test('/reservoir/{x}/{y} - Valid db result', async () => {
    riskQuery._resData(testData.getValidData())

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/reservoir/{x}/{y} - Exception raised during call', async () => {
    riskQuery.reservoirQuery.mockImplementationOnce(() => {
      return new Promise((_resolve, _reject) => {
        _reject(new Error('Issue with Promise.all call: Mock error'))
      })
    })

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_INTERNAL_SERVER_ERROR)
  })

  test('/reservoir/{x}/{y} - Empty Groundwater alert result', async () => {
    const inputData = testData.getValidData()
    // Clear out the warning data
    inputData.floodWarningAreas = null
    riskQuery._resData(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/reservoir/{x}/{y} - Empty Groundwater warning result', async () => {
    const inputData = testData.getValidData()
    // Clear out the alert data
    inputData.floodAlertAreas = null
    riskQuery._resData(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/reservoir/{x}/{y} - Groundwater alert result', async () => {
    const inputData = testData.getValidData()
    inputData.floodAlertAreas[0].attributes.FWS_TACODE = '033WAG204'
    riskQuery._resData(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/reservoir/{x}/{y} - Groundwater warning result', async () => {
    const inputData = testData.getValidData()
    inputData.floodWarningAreas[0].attributes.FWS_TACODE = '033WAG204'
    riskQuery._resData(inputData)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })
})
