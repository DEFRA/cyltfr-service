export function getReservoirWetRisk (riskQueryResult) {
  let reservoirWetRisk
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
  return reservoirWetRisk
}

export function getReservoirDryRisk (riskQueryResult) {
  let reservoirDryRisk
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
  return reservoirDryRisk
}

export const processAreaList = (areaList) => {
  const areaListReturn = []
  areaList?.forEach((area) => {
    areaListReturn.push(area.attributes.FWS_TACODE)
  })
  return areaListReturn
}

export const groundWaterAreaCheck = (areas) => {
  return areas.find((area) => area.charAt(5) === 'G') // NOSONAR
}
