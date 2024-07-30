const joi = require('joi')
const boom = require('@hapi/boom')
const service = require('../services')
const { riskQuery } = require('../services/riskQuery')

module.exports = {
  method: 'GET',
  path: '/floodrisk/{x}/{y}/{radius}',
  options: {
    description: 'Get the long term flood risk associated with a point',
    handler: async (request, _h) => {
      const params = request.params

      try {
        const result = await service.calculateFloodRisk(params.x, params.y, params.radius)
        const riskQueryResult = await riskQuery(params.x, params.y)

        /*
        * Do some assertions around the result we get back from the database
        */
        if (!riskQueryResult || !Array.isArray(result.rows) || result.rows.length !== 1) {
          return boom.badRequest('Invalid result', new Error('Expected an Array'))
        }

        const risk = result.rows[0].calculate_flood_risk // this can be removed data service ticket is complete

        if (!risk) {
          return boom.badRequest('Invalid result', new Error('Missing calculate_flood_risk key')) // this can be removed data service ticket is complete
        }

        /*
        * If we get here we can be sure we have a valid result from
        * the ESRI database and we can start to prepare our return response
        */
        let reservoirDryRisk = null
        let reservoirWetRisk = null
        let riverAndSeaRisk = null

        if (riskQueryResult.dryReservoirs.length > 0) {
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

        if (riskQueryResult.wetReservoirs.length > 0) {
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
        if (riskQueryResult.riversAndSea[0]) {
          riverAndSeaRisk = {
            probabilityForBand: riskQueryResult.riversAndSea[0].attributes.Risk_band
          }
        }

        let isGroundwaterArea = false
        const floodAlertList = []
        riskQueryResult.floodAlertAreas.forEach((area) => {
          floodAlertList.push(area.attributes.FWS_TACODE)
        })
        const floodWarningList = []
        riskQueryResult.floodWarningAreas.forEach((area) => {
          floodWarningList.push(area.attributes.FWS_TACODE)
        })

        const floodAlertAreas = Array.isArray(floodAlertList) ? floodAlertList : []
        const floodWarningAreas = Array.isArray(floodWarningList) ? floodWarningList : []
        const fifthChar = 5

        if (floodAlertAreas.find((faa) => faa.charAt(fifthChar) === 'G') || floodWarningAreas.find((fwa) => fwa.charAt(fifthChar) === 'G')) {
          isGroundwaterArea = true
        }

        const response = {
          inEngland: risk.in_england, // this will be done in another ticket for the data service
          isGroundwaterArea,
          floodAlertAreas,
          floodWarningAreas,
          leadLocalFloodAuthority: riskQueryResult.llfa[0].attributes.name,
          reservoirDryRisk,
          reservoirWetRisk,
          riverAndSeaRisk,
          surfaceWaterRisk: riskQueryResult.surfaceWater[0] ? riskQueryResult.surfaceWater[0].attributes.Risk_band : undefined,
          extraInfo: risk.extra_info // this will be done in another ticket for the data service
        }

        return response
      } catch (err) {
        return boom.badRequest('Issue processing query', err)
      }
    },
    validate: {
      params: joi.object().keys({
        x: joi.number().required(),
        y: joi.number().required(),
        radius: joi.number().required()
      }).required()
    }
  }
}
