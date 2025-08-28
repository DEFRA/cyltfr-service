const joi = require('joi')
const boom = require('@hapi/boom')
const { riskQuery } = require('../services/riskQuery')
const { getReservoirDryRisk, getReservoirWetRisk, processAreaList, groundWaterAreaCheck } = require('../services/processReservoirRisk')
const { getHighestRiskBand, RiskLevels, RiskOverrideLevels } = require('./getHighestRiskBand')

const handleSurfaceWaterRisk = (item, response) => {
  const riskOverride = item.riskoverride ? RiskOverrideLevels.indexOf(item.riskoverride.toLowerCase()) : -1
  if (riskOverride >= 0) {
    response.surfaceWaterRisk = RiskLevels[riskOverride]
    response.surfaceWaterRiskOverride = true
  }
  response.surfaceWaterRiskOverrideCC = item.riskoverridecc?.toLowerCase() === 'override'
}

const handleRiverAndSeaRisk = (item, response) => {
  const riskOverride = item.riskoverride ? RiskOverrideLevels.indexOf(item.riskoverride.toLowerCase()) : -1
  if (riskOverride >= 0) {
    response.riverAndSeaRisk = {
      probabilityForBand: RiskLevels[riskOverride]
    }
    response.riverAndSeaRiskOverride = true
  }
  response.riverAndSeaRiskOverrideCC = item.riskoverriderscc?.toLowerCase() === 'override'
}

const processExtraInfo = (item, response) => {
  const hasPresentDayOverride = Boolean(item.riskoverride)
  const hasClimateChangeOverride = item.riskoverriderscc?.toLowerCase() === 'override'
  const hasOverrides = hasPresentDayOverride || hasClimateChangeOverride

  if (!hasOverrides || item.apply !== 'holding') {
    return
  }

  const riskType = item.risktype?.toLowerCase().replace(/\s+/g, '')
  switch (riskType) {
    case 'surfacewater':
      handleSurfaceWaterRisk(item, response)
      break
    case 'riversandthesea':
      handleRiverAndSeaRisk(item, response)
      break
    default:
      console.warn(`Unexpected riskType: ${riskType}`)
  }
}

module.exports = {
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

      if (Array.isArray(response.extraInfo) && response.extraInfo.length) {
        response.extraInfo.forEach(item => processExtraInfo(item, response))
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
