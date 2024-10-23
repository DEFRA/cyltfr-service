const joi = require('joi')

// Define config schema
const schema = joi.object().keys({
  env: joi.string().default('dev').valid('dev', 'test', 'prod-green', 'prod-blue'),
  host: joi.string().hostname().default('0.0.0.0'),
  port: joi.number().integer().default(3000), // NOSONAR
  dataVersion: joi.string().default('01'),
  esriClientId: joi.string().required(),
  esriClientSecret: joi.string().required(),
  riskDataUrl: joi.string().required()
})

const config = {
  env: process.env.NODE_ENV,
  host: process.env.RISK_SERVICE_HOST,
  port: process.env.PORT,
  dataVersion: process.env.DATA_VERSION,
  esriClientId: process.env.ESRI_CLIENT_ID,
  esriClientSecret: process.env.ESRI_CLIENT_SECRET,
  riskDataUrl: process.env.RISK_DATA_URL
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

// Use the joi validated value
const value = result.value

// Add some helper props
value.isDev = value.env === 'dev'
value.isTest = value.env === 'test'
value.isProd = value.env.startsWith('prod-')

console.log('Server config', value)

module.exports = value
