const validDataRow = {
  in_england: true,
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
  surfaceWater: [
    { attributes: { Risk_band: 'High' } }
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
  in_england: true,
  floodAlertAreas: null,
  floodWarningAreas: null,
  riversAndSea: null,
  surfaceWater: null,
  dryReservoirs: null,
  llfa: [
    { attributes: { name: 'Warwickshire' } }
  ],
  extrainfo: null
}
const extraInfo = [{
  info: '',
  apply: 'holding',
  riskoverride: 'Low'
},
{
  info: '',
  apply: 'holding',
  riskoverride: 'Do not override'
},
{
  info: 'There are improvements to the flood defences in this area, we expect the flood liklihood in this area to change on 1 April 2020',
  apply: 'holding',
  riskoverride: 'Do not override'
},
{
  info: 'Some improvements to the flood defences in this area, we expect the flood liklihood in this area to change on 1 April 2020',
  apply: 'holding',
  riskoverride: 'Do not override'
},
{
  info: 'Proposed schemes',
  apply: 'llfa',
  riskoverride: null
},
{
  info: 'Flood action plan',
  apply: 'llfa',
  riskoverride: 'Do not override'
}]

const getTestData = function (inputData) {
  return { ...inputData }
}

const getValidData = function () {
  return getTestData(validDataRow)
}

const getEmptyData = function () {
  return getTestData(emptyDataRow)
}

const getExtraInfo = function () {
  return extraInfo
}

module.exports = {
  getValidData,
  getEmptyData,
  getExtraInfo
}
