const value = jest.requireActual('../config')

value.performanceLogging = false
value.dataVersion = '01'

value.setConfigOptions = function (newValues) {
  Object.keys(newValues).forEach(function (key) {
    value[key] = newValues[key]
  })
}

module.exports = value
