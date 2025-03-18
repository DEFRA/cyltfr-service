import riskRoutes from '../routes/risk.js'
// import rsDepthRoutes from '../routes/rsDepth'
// import swDepthRoutes from '../routes/swDepth'
// import errorRoutes from '../routes/error'
import healthcheckRoutes from '../routes/healthcheck'

const routes = [].concat(riskRoutes, rsDepthRoutes, swDepthRoutes, errorRoutes, healthcheckRoutes)

export const plugin = {
  name: 'router',
  register: (server, _options) => {
    server.route(routes)
  }
}
