const joi = require('joi')
const boom = require('@hapi/boom')
const service = require('../services')

module.exports = {
  method: 'GET',
  path: '/floodrisk/{x}/{y}/{radius}',
  options: {
    description: 'Get the long term flood risk associated with a point',
    handler: async (request, _h) => {
      const params = request.params

      try {
        const result = await service.calculateFloodRisk(params.x, params.y, params.radius)

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

        if (risk.dry_reservoir_risk && risk.dry_reservoir_risk !== 'Error') {
          reservoirDryRisk = risk.dry_reservoir_risk.map(function (item) {
            return {
              reservoirName: item.reservoir,
              location: item.ngr,
              riskDesignation: item.risk_designation,
              undertaker: item.undertaker,
              leadLocalFloodAuthority: item.llfa_name,
              comments: item.comments
            }
          })
        } else {
          reservoirDryRisk = risk.dry_reservoir_risk
        }

        if (risk.wet_reservoir_risk && risk.wet_reservoir_risk !== 'Error') {
          reservoirWetRisk = risk.wet_reservoir_risk.map(function (item) {
            return {
              reservoirName: item.reservoir,
              location: item.ngr,
              riskDesignation: item.risk_designation,
              undertaker: item.undertaker,
              leadLocalFloodAuthority: item.llfa_name,
              comments: item.comments
            }
          })
        } else {
          reservoirWetRisk = risk.wet_reservoir_risk
        }

        if (risk.rofrs_risk) {
          riverAndSeaRisk = {
            probabilityForBand: risk.rofrs_risk.prob_4band,
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
          surfaceWaterRisk: risk.surface_water_risk,
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
