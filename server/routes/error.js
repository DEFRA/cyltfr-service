const boom = require('@hapi/boom')

module.exports = {
  method: 'GET',
  path: '/error',
  options: {
    description: 'Path to test error handling',
    handler: async (_request, _h) => {
      return boom.badImplementation('/error test path', new Error())
    }
  }
}
