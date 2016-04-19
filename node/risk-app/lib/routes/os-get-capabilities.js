var Boom = require('boom')
var wreck = require('wreck').defaults({
  timeout: config.httpTimeoutMs
})
var config = require('../../config')

module.exports = {
  method: 'GET',
  path: '/os-get-capabilities',
  handler: function (request, reply) {
    wreck.get(config.ordnanceSurvey.urlGetCapabilities, function (err, response, payload) {
      if (err || response.statusCode !== 200) {
        return reply(Boom.badRequest('Ordnance survey getcapabilities failed', err))
      }
      reply(payload).type('text/xml')
    })
  }
}