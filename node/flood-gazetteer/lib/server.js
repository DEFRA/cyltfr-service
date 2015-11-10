function server (startServerCallback) {
  var Hapi = require('hapi')
  var Config = require('config')
  var routes = require('./routes')
  var plugins = require('./plugins')
  var options = Config.get('server')

  var server = new Hapi.Server()

  // server connection
  server.connection(options)

  // register plugins
  plugins(server, startServerCallback)

  // register routes
  server.route(routes)
}

module.exports = server
