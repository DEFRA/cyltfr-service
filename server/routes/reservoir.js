const joi = require('joi')
const boom = require('@hapi/boom')
const { reservoirQuery } = require('../services/riskQuery')

module.exports = {
  method: 'GET',
  path: '/reservoir/{x}/{y}',
  options: {
    description: 'Get the reservoir flood risk associated with a point',
    handler: async (request, _h) => {
      const params = request.params

      const riskQueryResult = await reservoirQuery(params.x, params.y)

      /*
        * Do some assertions around the result we get back from the database
        */
      if (!riskQueryResult) {
        return boom.badRequest('Invalid result', new Error('Invalid query response'))
      }

      /*
        * If we get here we can be sure we have a valid result from
        * the ESRI database and we can start to prepare our return response
        */
      let reservoirDryRisk = null
      let reservoirWetRisk = null

      if (riskQueryResult.dryReservoirs?.length > 0) {
        reservoirDryRisk = riskQueryResult.dryReservoirs.map(function (item) {
          return {
            reservoirName: item.attributes.reservoir,
            location: item.attributes.ngr,
            riskDesignation: item.attributes.risk_designation,
            undertaker: item.attributes.undertaker,
            leadLocalFloodAuthority: item.attributes.llfa_name,
            comments: item.attributes.comments
          }
        })
      } else {
        reservoirDryRisk = riskQueryResult.dryReservoirs
      }

      if (riskQueryResult.wetReservoirs?.length > 0) {
        reservoirWetRisk = riskQueryResult.wetReservoirs.map(function (item) {
          return {
            reservoirName: item.attributes.RESERVOIR,
            location: item.attributes.NGR,
            riskDesignation: item.attributes.RISK_DESIGNATION,
            undertaker: item.attributes.UNDERTAKER,
            leadLocalFloodAuthority: item.attributes.LLFA_NAME,
            comments: item.attributes.COMMENTS
          }
        })
      } else {
        reservoirWetRisk = riskQueryResult.wetReservoirs
      }

      let isGroundwaterArea = false
      const floodAlertAreas = []
      riskQueryResult.floodAlertAreas?.forEach((area) => {
        floodAlertAreas.push(area.attributes.FWS_TACODE)
      })
      const floodWarningAreas = []
      riskQueryResult.floodWarningAreas?.forEach((area) => {
        floodWarningAreas.push(area.attributes.FWS_TACODE)
      })

      const fifthChar = 5

      if (floodAlertAreas.find((faa) => faa.charAt(fifthChar) === 'G') || floodWarningAreas.find((fwa) => fwa.charAt(fifthChar) === 'G')) {
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
