const routes = [].concat(
  require('../routes/risk'),
  require('../routes/is-england'),
  require('../routes/error'),
  require('../routes/healthcheck')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route(routes)
    }
  }
}
