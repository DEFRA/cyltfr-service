const { Pool } = require('pg')
const config = require('./config')
const pool = new Pool({
  connectionString: config.db
})

module.exports = {
  query: pool.query.bind(pool)
}
