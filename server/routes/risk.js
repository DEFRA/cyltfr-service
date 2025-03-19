import joi from 'joi'
import boom from '@hapi/boom'
import { riskQuery } from '../services/riskQuery.js'
import { getReservoirDryRisk, getReservoirWetRisk, processAreaList, groundWaterAreaCheck } from '../services/processReservoirRisk.js'
import { getHighestRiskBand, RiskLevels, RiskOverrideLevels } from './getHighestRiskBand.js'

export default {
  method: 'GET',
  path: '/floodrisk/{x}/{y}',
  options: {
    description: 'Get the long term flood risk associated with a point',
    handler: async (request, _h) => {
      const params = request.params

      const riskQueryResult = await riskQuery(params.x, params.y)

      /*
        * Do some assertions around the result we get back from the database
        */
      if (!riskQueryResult) {
        return boom.badRequest('Invalid result', new Error('Invalid query response'))
      }

      let riverAndSeaRisk = null
      let riverAndSeaRiskCC = null

      /*
        * If we get here we can be sure we have a valid result from
        * the ESRI database and we can start to prepare our return response
        */
      const reservoirDryRisk = getReservoirDryRisk(riskQueryResult)

      const reservoirWetRisk = getReservoirWetRisk(riskQueryResult)

      const rAndSband = getHighestRiskBand(riskQueryResult.riversAndSea)
      if (rAndSband) {
        riverAndSeaRisk = {
          probabilityForBand: RiskLevels[RiskOverrideLevels.indexOf(rAndSband.toLowerCase())] || rAndSband
        }
      }

      const rAndSbandCC = getHighestRiskBand(riskQueryResult.riversAndSeaCC)
      if (rAndSbandCC) {
        riverAndSeaRiskCC = {
          probabilityForBand: RiskLevels[RiskOverrideLevels.indexOf(rAndSbandCC.toLowerCase())] || rAndSbandCC
        }
      }

      let isGroundwaterArea = false

      const floodAlertAreas = processAreaList(riskQueryResult.floodAlertAreas)
      const floodWarningAreas = processAreaList(riskQueryResult.floodWarningAreas)

      if (groundWaterAreaCheck(floodAlertAreas) || groundWaterAreaCheck(floodWarningAreas)) {
        isGroundwaterArea = true
      }

      const llfa = riskQueryResult.llfa?.length > 0 ? riskQueryResult.llfa[0].attributes.name : 'Unknown'

      const response = {
        isGroundwaterArea,
        floodAlertAreas,
        floodWarningAreas,
        leadLocalFloodAuthority: llfa,
        reservoirDryRisk,
        reservoirWetRisk,
        riverAndSeaRisk,
        riverAndSeaRiskCC,
        surfaceWaterRisk: getHighestRiskBand(riskQueryResult.surfaceWater),
        surfaceWaterRiskCC: getHighestRiskBand(riskQueryResult.surfaceWaterCC),
        extraInfo: riskQueryResult.extrainfo
      }

      const processExtraInfo = (item) => {
        if ((item.riskoverride) && (item.apply === 'holding')) {
          const riskOverride = RiskOverrideLevels.indexOf(item.riskoverride.toLowerCase())
          if (riskOverride >= 0) {
            response.surfaceWaterRisk = RiskLevels[riskOverride]
          }
        }
      }

      if (Array.isArray(response.extraInfo) && response.extraInfo.length) {
        response.extraInfo.forEach(processExtraInfo)
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
