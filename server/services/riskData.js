const fetch = require('node-fetch')

async function riskData (url) {
  return fetch(url).then(res => res.json())
}

module.exports = { riskData }
