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

const getHighestRiskBand = (riskBands) => {
  let retval
  if (Array.isArray(riskBands) && riskBands.length) {
    retval = riskBands.reduce((acc, curr) => {
      if (RiskOverrideLevels.indexOf(curr.attributes.Risk_band.toLowerCase()) > RiskOverrideLevels.indexOf(acc.attributes.Risk_band.toLowerCase())) {
        return curr
      }
      return acc
    })
  }
  return retval ? retval.attributes.Risk_band : null
}

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
      let riverAndSeaRiskCC = null

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

      const llfa = riskQueryResult.llfa ? riskQueryResult.llfa[0].attributes.name : 'Unknown'

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
        y: joi.number().required(),
        radius: joi.number().required()
      }).required()
    }
  }
}
