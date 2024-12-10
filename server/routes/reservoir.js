const joi = require('joi')
const boom = require('@hapi/boom')
const { reservoirQuery } = require('../services/riskQuery')
const { getReservoirDryRisk, getReservoirWetRisk, processAreaList, groundWaterAreaCheck } = require('./getReservoirDryRisk')

module.exports = {
  method: 'GET',
  path: '/reservoir/{x}/{y}',
  options: {
    description: 'Get the reservoir flood risk associated with a point',
    handler: async (request, _h) => {
      const params = request.params

      const reservoirQueryResult = await reservoirQuery(params.x, params.y)

      /*
        * Do some assertions around the result we get back from the database
        */
      if (!reservoirQueryResult) {
        return boom.badRequest('Invalid result', new Error('Invalid query response'))
      }

      /*
        * If we get here we can be sure we have a valid result from
        * the ESRI database and we can start to prepare our return response
        */
      const reservoirDryRisk = getReservoirDryRisk(reservoirQueryResult)

      const reservoirWetRisk = getReservoirWetRisk(reservoirQueryResult)

      let isGroundwaterArea = false
      const floodAlertAreas = processAreaList(reservoirQueryResult.floodAlertAreas)
      const floodWarningAreas = processAreaList(reservoirQueryResult.floodWarningAreas)

      if (groundWaterAreaCheck(floodAlertAreas) || groundWaterAreaCheck(floodWarningAreas)) {
        isGroundwaterArea = true
      }

      const response = {
        isGroundwaterArea,
        floodAlertAreas,
        floodWarningAreas,
        reservoirDryRisk,
        reservoirWetRisk
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
