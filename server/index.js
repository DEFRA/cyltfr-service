import Hapi from '@hapi/hapi'
import { dataConfig } from './config.js'
import { plugin as router } from './plugins/router.js'
import logErrors from './plugins/log-errors.js'
import logging from './plugins/logging.js'
import blipp from 'blipp'

async function createServer () {
  // Create the hapi server
  const server = Hapi.server({
    host: dataConfig.host,
    port: dataConfig.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    }
  })

  // Register the plugins
  await server.register(router)
  await server.register(logErrors)
  await server.register(logging)
  await server.register(blipp)

  return server
}

export { createServer }
