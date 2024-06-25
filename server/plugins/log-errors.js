/*
* Add an `onPreResponse` listener to return error pages
*/

module.exports = {
  plugin: {
    name: 'log-errors',
    register: (server, _options) => {
      server.ext('onPreResponse', (request, h) => {
        const response = request.response

        if (response.isBoom) {
          // An error was raised while
          // processing the request
          const statusCode = response.output.statusCode

          // Log the error
          request.log('error', {
            statusCode,
            data: response.data,
            message: response.message
          })
        }

        return h.continue
      })
    }
  }
}
