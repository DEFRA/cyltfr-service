const STATUS_CODES = require('http2').constants
const createServer = require('../../index')
let server

beforeAll(async () => {
  server = await createServer()
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
})

describe('/Error page test', () => {
  test('Assert Error page', async () => {
    const options = {
      method: 'GET',
      url: '/error',
      headers: {

      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_INTERNAL_SERVER_ERROR) // 500
  })
})
