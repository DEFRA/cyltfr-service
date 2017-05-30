var OsViewModel = require('../models/os-terms-view')

module.exports = {
  method: 'GET',
  path: '/os-terms',
  config: {
    description: 'Get Ordnance Survey terms and conditions',
    handler: function (request, reply) {
      reply.view('os-terms', new OsViewModel(request.query.err))
    }
  }
}