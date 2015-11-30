var Joi = require('joi')
var Boom = require('boom')
var addressService = require('../services/address')
var HomeViewModel = require('../models/home-view')
var SearchViewModel = require('../models/search-view')

module.exports = {
  method: 'GET',
  path: '/search',
  config: {
    description: 'Get postcode search results',
    handler: function (request, reply) {
      var postcode = request.query.postcode

      addressService.findByPostcode(postcode, function (err, addresses) {
        if (err) {
          request.log('error', err)
          return reply(Boom.badRequest())
        }

        if (!addresses.length) {
          reply.view('home', new HomeViewModel('Please enter a valid postcode in England'))
        } else {
          reply.view('search', new SearchViewModel(addresses))
        }
      })
    },
    validate: {
      query: {
        postcode: Joi.string().required()
      }
    }
  }
}