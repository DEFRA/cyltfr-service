const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')

jest.mock('@esri/arcgis-rest-feature-service')
jest.mock('@esri/arcgis-rest-request')
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
    '/floodrisk/564228/263339/20'
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
