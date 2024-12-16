const joi = require('joi')
const boom = require('@hapi/boom')
const { surfaceWaterDepth } = require('../services/riskQuery')
const { getHighestRiskBand } = require('./getHighestRiskBand')

module.exports = {
  method: 'GET',
  path: '/swdepth/{x}/{y}',
  options: {
    description: 'Get the surface water depth risk associated with a point',
    handler: async (request, _h) => {
      const params = request.params

      const swDepthResult = await surfaceWaterDepth(params.x, params.y)

      /*
        * Do some assertions around the result we get back from the database
        */
      if (!swDepthResult) {
        return boom.badRequest('Invalid result', new Error('Invalid query response'))
      }

      /*
        * If we get here we can be sure we have a valid result from
        * the ESRI database and we can start to prepare our return response
        */
      const response = {
        200: {
          current: getHighestRiskBand(swDepthResult.surfaceWaterDepth200mm),
          cc: getHighestRiskBand(swDepthResult.surfaceWaterCCDepth200mm)
        },
        300: {
          current: getHighestRiskBand(swDepthResult.surfaceWaterDepth300mm),
          cc: getHighestRiskBand(swDepthResult.surfaceWaterCCDepth300mm)
        },
        600: {
          current: getHighestRiskBand(swDepthResult.surfaceWaterDepth600mm),
          cc: getHighestRiskBand(swDepthResult.surfaceWaterCCDepth600mm)
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
