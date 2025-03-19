import { constants as STATUS_CODES } from 'http2'
import { createServer } from '../../index.js'

let server

jest.mock('../../config')

beforeAll(async () => {
  server = await createServer()
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
})

describe('/Healthcheck test', () => {
  test('Assert Healthcheck page', async () => {
    const options = {
      method: 'GET',
      url: '/healthcheck',
      headers: {

      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
    expect(response.payload).toMatch(/"healthy":1/g)
  })
})
