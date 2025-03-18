export const RiskOverrideLevels = [
  'very low',
  'low',
  'medium',
  'high'
]
export const RiskLevels = [
  'Very Low',
  'Low',
  'Medium',
  'High'
]

export const getHighestRiskBand = (riskBands) => {
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
