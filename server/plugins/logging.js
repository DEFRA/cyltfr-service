import { dataConfig } from '../config.js'
import hapiPino from 'hapi-pino'

export default {
  plugin: hapiPino,
  options: {
    logPayload: true,
    level: dataConfig.isDev ? 'debug' : 'warn'
  }
}
