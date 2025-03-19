import joi from 'joi'
import boom from '@hapi/boom'
import { riversAndSeaDepth } from '../services/riskQuery.js'
import { getHighestRiskBand } from './getHighestRiskBand.js'

export default {
  method: 'GET',
  path: '/rsdepth/{x}/{y}',
  options: {
    description: 'Get the Rivers and sea depth risk associated with a point',
    handler: async (request, _h) => {
      const params = request.params

      const rsDepthResult = await riversAndSeaDepth(params.x, params.y)

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
          current: getHighestRiskBand(rsDepthResult.riversAndSeaDepth200mm),
          cc: getHighestRiskBand(rsDepthResult.riversAndSeaCCDepth200mm)
        },
        300: {
          current: getHighestRiskBand(rsDepthResult.riversAndSeaDepth300mm),
          cc: getHighestRiskBand(rsDepthResult.riversAndSeaCCDepth300mm)
        },
        600: {
          current: getHighestRiskBand(rsDepthResult.riversAndSeaDepth600mm),
          cc: getHighestRiskBand(rsDepthResult.riversAndSeaCCDepth600mm)
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
