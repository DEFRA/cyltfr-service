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
        if (!result || !Array.isArray(result.rows) || result.rows.length !== 1) {
          return boom.badRequest('Invalid result', new Error('Expected an Array'))
        }

        const risk = result.rows[0].calculate_flood_risk

        if (!risk) {
          return boom.badRequest('Invalid result', new Error('Missing calculate_flood_risk key'))
        }

        /*
         * If we get here we can be sure we have a valid result from
         * the database and we can start to prepare our return response
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

        if (risk.rofrs_risk) {
          riverAndSeaRisk = {
            probabilityForBand: riskQueryResult.riversAndSea[0].attributes.Risk_band,
            suitability: risk.rofrs_risk.suitability,
            riskForInsuranceSOP: risk.rofrs_risk.risk_for_insurance_sop
          }
        }

        let isGroundwaterArea = false
        const floodAlertArea = Array.isArray(risk.flood_alert_area) ? risk.flood_alert_area : []
        const floodWarningArea = Array.isArray(risk.flood_warning_area) ? risk.flood_warning_area : []

        if (floodAlertArea.find((faa) => faa.charAt(5) === 'G')) {
          isGroundwaterArea = true
        } else if (floodWarningArea.find((fwa) => fwa.charAt(5) === 'G')) {
          isGroundwaterArea = true
        }

        const response = {
          inEngland: risk.in_england,
          isGroundwaterArea,
          floodAlertArea,
          floodWarningArea,
          inFloodAlertArea: risk.flood_alert_area === 'Error' ? 'Error' : floodAlertArea.length > 0,
          inFloodWarningArea: risk.flood_warning_area === 'Error' ? 'Error' : floodWarningArea.length > 0,
          leadLocalFloodAuthority: risk.lead_local_flood_authority,
          reservoirDryRisk,
          reservoirWetRisk,
          riverAndSeaRisk,
          surfaceWaterRisk: riskQueryResult.surfaceWater[0].attributes.Risk_band,
          surfaceWaterSuitability: risk.surface_water_suitability,
          extraInfo: risk.extra_info
        }

        return response
      } catch (err) {
        return boom.badRequest('Database call failed', err)
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
