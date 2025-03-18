import joi from 'joi'

// Define config schema
const schema = joi.object().keys({
  env: joi.string().default('dev').valid('dev', 'test', 'prod-green', 'prod-blue'),
  host: joi.string().hostname().default('0.0.0.0'),
  port: joi.number().integer().default(3000), // NOSONAR
  performanceLogging: joi.boolean().default(false),
  dataVersion: joi.string().default('test'),
  esriClientId: joi.string().required(),
  esriClientSecret: joi.string().required(),
  riskDataUrl: joi.string().required()
})

const config = {
  env: process.env.NODE_ENV,
  host: process.env.RISK_SERVICE_HOST,
  port: process.env.PORT,
  performanceLogging: process.env.PERFORMANCE_LOGGING,
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
  throw new Error(`Config validation error: ${result.error.message}`)
}

// Use the joi validated value
const dataConfig = result.value

// Add some helper props
dataConfig.isDev = dataConfig.env === 'dev'
dataConfig.isTest = dataConfig.env === 'test'
dataConfig.isProd = dataConfig.env.startsWith('prod-')
if (process.env.JEST_WORKER_ID === undefined) {
  console.log('Server config', dataConfig)
}

export { dataConfig }
