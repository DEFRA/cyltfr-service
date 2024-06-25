const queries = require('./queries.json')
const db = require('../db')
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

const floodRiskService = {
  calculateFloodRisk: function (x, y, radius) {
    const queryResult = db.query(queries.calculateFloodRisk, [x, y, radius])

    // Check if SurfaceWaterRisk has been overridden.
    queryResult.then(queryResult => {
      if (!queryResult || !Array.isArray(queryResult.rows) || queryResult.rows.length !== 1) {
        return queryResult
      }

      const risk = queryResult.rows[0].calculate_flood_risk

      if (!risk) {
        return queryResult
      }
      if (risk.extra_info !== 'Error') {
        if (Array.isArray(risk.extra_info) && risk.extra_info.length) {
          risk.extra_info.forEach(item => {
            if (!(item.riskoverride == null)) {
              if (item.apply === 'holding') {
                const riskOverride = RiskOverrideLevels.indexOf(item.riskoverride.toLowerCase())
                if (riskOverride >= 0) {
                  risk.surface_water_risk = RiskLevels[riskOverride]
                }
              }
            }
          })
        }
      }
    })

    return queryResult
  },
  isEngland: function (lng, lat) {
    return db.query(queries.isEngland, [lng, lat])
  }
}

module.exports = floodRiskService
