const getReservoirMapping = function (item) {
  return {
    reservoirName: item.attributes.reservoir ? item.attributes.reservoir : item.attributes.RESERVOIR,
    location: item.attributes.ngr ? item.attributes.ngr : item.attributes.NGR,
    riskDesignation: item.attributes.risk_designation ? item.attributes.risk_designation : item.attributes.RISK_DESIGNATION,
    undertaker: item.attributes.undertaker ? item.attributes.undertaker : item.attributes.UNDERTAKER,
    leadLocalFloodAuthority: item.attributes.llfa_name ? item.attributes.llfa_name : item.attributes.LLFA_NAME,
    comments: item.attributes.comments ? item.attributes.comments : item.attributes.COMMENTS
  }
}
function getReservoirWetRisk (riskQueryResult) {
  let reservoirWetRisk
  if (riskQueryResult.wetReservoirs?.length > 0) {
    reservoirWetRisk = riskQueryResult.wetReservoirs.map(getReservoirMapping)
  } else {
    reservoirWetRisk = riskQueryResult.wetReservoirs
  }
  return reservoirWetRisk
}
exports.getReservoirWetRisk = getReservoirWetRisk
function getReservoirDryRisk (riskQueryResult) {
  let reservoirDryRisk
  if (riskQueryResult.dryReservoirs?.length > 0) {
    reservoirDryRisk = riskQueryResult.dryReservoirs.map(getReservoirMapping)
  } else {
    reservoirDryRisk = riskQueryResult.dryReservoirs
  }
  return reservoirDryRisk
}
exports.getReservoirDryRisk = getReservoirDryRisk

const processAreaList = (areaList) => {
  const areaListReturn = []
  areaList?.forEach((area) => {
    areaListReturn.push(area.attributes.FWS_TACODE)
  })
  return areaListReturn
}
exports.processAreaList = processAreaList

const groundWaterAreaCheck = (areas) => {
  return areas.find((area) => area.charAt(5) === 'G') // NOSONAR
}

exports.groundWaterAreaCheck = groundWaterAreaCheck
