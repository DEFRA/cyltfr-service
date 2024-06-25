const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')

jest.deepUnmock('../../../server/db')
let server

describe('Integration tests - /floodrisk', () => {
  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  const urls = [
    '/floodrisk/391416/102196/20'
  ]

  urls.forEach((url) => {
    test(url, async () => {
      const options = {
        method: 'GET',
        url
      }

      const response = await server.inject(options)
      expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    })
  })
})
