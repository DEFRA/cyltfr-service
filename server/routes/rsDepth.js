const joi = require('joi')
const boom = require('@hapi/boom')
const { riversAndSeaDepth } = require('../services/riskQuery')
const RiskOverrideLevels = [
  'very low',
  'low',
  'medium',
  'high'
]
const RiskLevels = [
  'Very Low',
  'Low',
  'Medium',
  'High'
]

module.exports = {
  method: 'GET',
  path: '/rsdepth/{x}/{y}',
  options: {
    description: 'Get the Rivers and sea depth risk associated with a point',
    handler: async (request, _h) => {
      const params = request.params

      const rsDepthResult = await riversAndSeaDepth(params.x, params.y)

      const getBand = (data) => {
        const riskBand = Array.isArray(data) && data[0] ? data[0].attributes.Risk_band : undefined
        return RiskLevels[RiskOverrideLevels.indexOf(riskBand?.toLowerCase())] || riskBand
      }

      /*
        * Do some assertions around the result we get back from the database
        */
      if (!rsDepthResult) {
        return boom.badRequest('Invalid result', new Error('Invalid query response'))
      }

      /*
        * If we get here we can be sure we have a valid result from
        * the ESRI database and we can start to prepare our return response
        */
      const response = {
        200: {
          current: getBand(rsDepthResult.riversAndSeaDepth200mm),
          cc: getBand(rsDepthResult.riversAndSeaCCDepth200mm)
        },
        300: {
          current: getBand(rsDepthResult.riversAndSeaDepth300mm),
          cc: getBand(rsDepthResult.riversAndSeaCCDepth300mm)
        },
        600: {
          current: getBand(rsDepthResult.riversAndSeaDepth600mm),
          cc: getBand(rsDepthResult.riversAndSeaCCDepth600mm)
        }
      }

      return response
    },
    validate: {
      params: joi.object().keys({
        x: joi.number().required(),
        y: joi.number().required()
      }).required()
    }
  }
}
