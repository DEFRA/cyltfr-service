import 'dotenv/config'
import createServer from './server/index.js'

createServer()
  .then(server => server.start())
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
