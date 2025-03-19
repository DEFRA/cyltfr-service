import riskRoutes from '../routes/risk.js'
import rsDepthRoutes from '../routes/rsDepth.js'
import swDepthRoutes from '../routes/swDepth.js'
import errorRoutes from '../routes/error.js'
import healthcheckRoutes from '../routes/healthcheck.js'

const routes = [].concat(riskRoutes, rsDepthRoutes, swDepthRoutes, errorRoutes, healthcheckRoutes)

export const plugin = {
  name: 'router',
  register: (server, _options) => {
    server.route(routes)
  }
}
