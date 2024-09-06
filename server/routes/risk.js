const joi = require('joi')
const boom = require('@hapi/boom')
const { riskQuery } = require('../services/riskQuery')
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
  path: '/floodrisk/{x}/{y}/{radius}',
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

      /*
        * If we get here we can be sure we have a valid result from
        * the ESRI database and we can start to prepare our return response
        */
      let reservoirDryRisk = null
      let reservoirWetRisk = null
      let riverAndSeaRisk = null

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
      if (riskQueryResult.riversAndSea?.[0]) {
        const riskBand = riskQueryResult.riversAndSea[0].attributes.Risk_band
        riverAndSeaRisk = {
          probabilityForBand: RiskLevels[RiskOverrideLevels.indexOf(riskBand.toLowerCase())] || riskBand
        }
      }

      let isGroundwaterArea = false
      const floodAlertList = []
      riskQueryResult.floodAlertAreas?.forEach((area) => {
        floodAlertList.push(area.attributes.FWS_TACODE)
      })
      const floodWarningList = []
      riskQueryResult.floodWarningAreas?.forEach((area) => {
        floodWarningList.push(area.attributes.FWS_TACODE)
      })

      const floodAlertAreas = floodAlertList
      const floodWarningAreas = floodWarningList
      const fifthChar = 5

      if (floodAlertAreas.find((faa) => faa.charAt(fifthChar) === 'G') || floodWarningAreas.find((fwa) => fwa.charAt(fifthChar) === 'G')) {
        isGroundwaterArea = true
      }

      const response = {
        inEngland: true, // this will be done in another ticket for the data service
        isGroundwaterArea,
        floodAlertAreas,
        floodWarningAreas,
        leadLocalFloodAuthority: riskQueryResult.llfa[0].attributes.name,
        reservoirDryRisk,
        reservoirWetRisk,
        riverAndSeaRisk,
        surfaceWaterRisk: Array.isArray(riskQueryResult.surfaceWater) && riskQueryResult.surfaceWater[0] ? riskQueryResult.surfaceWater[0].attributes.Risk_band : undefined,
        extraInfo: riskQueryResult.extrainfo
      }

      const processExtraInfo = (item) => {
        if ((item.riskoverride !== null) && (item.apply === 'holding')) {
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
        y: joi.number().required(),
        radius: joi.number().required()
      }).required()
    }
  }
}
