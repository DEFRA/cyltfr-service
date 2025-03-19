import boom from '@hapi/boom'

export default {
  method: 'GET',
  path: '/error',
  options: {
    description: 'Path to test error handling',
    handler: async (_request, _h) => {
      return boom.badImplementation('/error test path', new Error())
    }
  }
}
