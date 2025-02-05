const value = jest.requireActual('../config')

value.performanceLogging = false
value.dataVersion = 'test'

value.setConfigOptions = function (newValues) {
  Object.keys(newValues).forEach(function (key) {
    value[key] = newValues[key]
  })
}

module.exports = value
