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

  ]
}
const emptyDataRow = {
  floodAlertAreas: null,
  floodWarningAreas: null,
  dryReservoirs: null,
  wetReservoirs: null
}

const getValidData = function () {
  return { ...validDataRow }
}

const getEmptyData = function () {
  return { ...emptyDataRow }
}

module.exports = {
  getValidData,
  getEmptyData
}
