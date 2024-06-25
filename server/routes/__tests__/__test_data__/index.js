const validDataRow = {
  in_england: true,
  flood_alert_area: [
    '033WAF204'
  ],
  flood_warning_area: [
    '033FWF3AVON013'
  ],
  rofrs_risk: {
    prob_4band: 'Medium',
    suitability: 'Street to Parcels of land',
    risk_for_insurance_sop: 'Yes'
  },
  surface_water_risk: 'High',
  reservoir_risk: [
    {
      resname: 'Draycote Water',
      risk_desig: 'High Risk',
      location: '445110, 270060',
      ut_company: 'Severn Trent Water Authority',
      ea_area: 'Environment Agency - Staffordshire, Warwickshire and West Midlands',
      llfa_name: 'Warwickshire',
      comments: 'If you have questions about local emergency plans for this reservoir you should contact the named Local Authority'
    }
  ],
  surface_water_suitability: 'County to Town',
  lead_local_flood_authority: 'Warwickshire',
  extra_info: null
}
const emptyDataRow = {
  in_england: true,
  flood_alert_area: null,
  flood_warning_area: null,
  rofrs_risk: null,
  surface_water_risk: 'Very Low',
  reservoir_risk: null,
  surface_water_suitability: 'County to Town',
  lead_local_flood_authority: 'Cheshire West and Chester',
  extra_info: null
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
  return [
    {
      calculate_flood_risk: { ...inputData }
    }
  ]
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
