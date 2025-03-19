import { constants as STATUS_CODES } from 'http2'
import { createServer } from '../../index.js'
import { riskQuery } from '../../services/riskQuery.js'
import * as testData from './__test_data__/index.js'

const options = {
  method: 'GET',
  url: '/swdepth/564228/263339'
}

jest.mock('../../config')
jest.mock('@esri/arcgis-rest-request')
jest.mock('../../services/riskQuery')
let server

describe('Unit tests - /rsDepth', () => {
  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  test('Normal get returns the payload', async () => {
    riskQuery._swData({})

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/swdepth/{x}/{y} - No db result', async () => {
    riskQuery._swData(undefined)

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST)
  })

  test('/swdepth/{x}/{y}} - Valid db result', async () => {
    riskQuery._swData(testData.getValidData())

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/swdepth/{x}/{y} - Exception raised during call', async () => {
    riskQuery.surfaceWaterDepth.mockImplementationOnce(() => {
      return Promise.reject(new Error('Issue with Promise.all call: Mock error'))
    })

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_INTERNAL_SERVER_ERROR)
  })
})
