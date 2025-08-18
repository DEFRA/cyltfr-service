const validDataRow = {
  floodAlertAreas: [
    {
      attributes: {
        FWS_TACODE: '033WAF204'
      }
    }
  ],
  floodWarningAreas: [
    {
      attributes: {
        FWS_TACODE: '033WAF204'
      }
    }
  ],
  riversAndSea: [
    {
      attributes: {
        Risk_band: 'Medium'
      }
    }],
  riversAndSeaCC: [
    {
      attributes: {
        Risk_band: 'Medium'
      }
    }],
  surfaceWater: [
    { attributes: { Risk_band: 'Low' } },
    { attributes: { Risk_band: 'High' } }
  ],
  surfaceWaterCC: [
    { attributes: { Risk_band: 'High' } },
    { attributes: { Risk_band: 'Low' } }
  ],
  dryReservoirs: [
    {
      attributes: {
        reservoir: 'Draycote Water',
        risk_designation: 'High Risk',
        ngr: '445110, 270060',
        undertaker: 'Severn Trent Water Authority',
        llfa_name: 'Warwickshire',
        comments: 'If you have questions about local emergency plans for this reservoir you should contact the named Local Authority'
      }
    }],
  wetReservoirs: [
    {
      attributes: {
        reservoir: 'Draycote Water',
        risk_designation: 'High Risk',
        ngr: '445110, 270060',
        undertaker: 'Severn Trent Water Authority',
        llfa_name: 'Warwickshire',
        comments: 'If you have questions about local emergency plans for this reservoir you should contact the named Local Authority'
      }
    }

  ],
  llfa: [
    { attributes: { name: 'Warwickshire' } }
  ],
  extrainfo: null
}
const emptyDataRow = {
  floodAlertAreas: null,
  floodWarningAreas: null,
  riversAndSea: null,
  surfaceWater: null,
  riversAndSeaCC: null,
  surfaceWaterCC: null,
  dryReservoirs: null,
  llfa: [
    { attributes: { name: 'Warwickshire' } }
  ],
  extrainfo: null
}
const nollfaDataRow = {
  floodAlertAreas: null,
  floodWarningAreas: null,
  riversAndSea: null,
  surfaceWater: null,
  riversAndSeaCC: [
    {
      attributes: {
        Risk_band: 'No data'
      }
    }],
  surfaceWaterCC: null,
  dryReservoirs: null,
  extrainfo: null
}
const noOverride = 'Do not override'
const extraInfo = [{
  info: '',
  apply: 'holding',
  riskoverride: 'Low',
  risktype: 'Surface Water'
},
{
  info: '',
  apply: 'holding',
  riskoverride: noOverride,
  risktype: 'Surface Water',
  riskoverridecc: 'Override'
},
{
  info: '',
  apply: 'holding',
  riskoverride: 'Low',
  risktype: 'Rivers and the sea'
},
{
  info: '',
  apply: 'holding',
  riskoverride: noOverride
},
{
  info: 'There are improvements to the flood defences in this area, we expect the flood liklihood in this area to change on 1 April 2020',
  apply: 'holding',
  riskoverride: noOverride
},
{
  info: 'Some improvements to the flood defences in this area, we expect the flood liklihood in this area to change on 1 April 2020',
  apply: 'holding',
  riskoverride: noOverride
},
{
  info: 'Proposed schemes',
  apply: 'llfa',
  riskoverride: null
},
{
  info: 'Flood action plan',
  apply: 'llfa',
  riskoverride: noOverride
}]

const extraInfoRSCC = [{
  info: '',
  apply: 'holding',
  riskoverride: null,
  risktype: 'Rivers and the sea',
  riskoverriderscc: 'Override'
}]

const getValidData = function () {
  return { ...validDataRow }
}

const getEmptyData = function () {
  return { ...emptyDataRow }
}

const getNoLLFAData = function () {
  return { ...nollfaDataRow }
}

const getExtraInfo = function () {
  return extraInfo
}
const getExtraInfoRSCC = function () {
  return extraInfoRSCC
}

const getNoRiskOverrideData = function () {
  const retval = { ...nollfaDataRow }
  retval.extrainfo = [{ risktype: 'Rivers and the sea', info: 'Test data', apply: 'holding' }]
  return retval
}

const validRsDepth = {
  200: {
    current: 'High',
    cc: 'High'
  },
  300: {
    current: 'High',
    cc: 'High'
  },
  600: {
    current: 'Low',
    cc: 'Medium'
  }
}

const validSwDepth = {
  200: {
    cc: 'Low'
  },
  300: {
    cc: 'Very Low'
  },
  600: {
    cc: 'Very Low'
  }
}

const getValidRsDepth = () => {
  return { ...validRsDepth }
}

const getValidSwDepth = () => {
  return { ...validSwDepth }
}

module.exports = {
  getValidData,
  getEmptyData,
  getNoLLFAData,
  getExtraInfo,
  getExtraInfoRSCC,
  getValidRsDepth,
  getValidSwDepth,
  getNoRiskOverrideData
}
