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

exports.getHighestRiskBand = getHighestRiskBand
exports.RiskOverrideLevels = RiskOverrideLevels
exports.RiskLevels = RiskLevels
