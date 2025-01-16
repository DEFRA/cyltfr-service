const http = require('node:http')
const https = require('node:https')
const fetch = require('node-fetch')

const httpAgent = new http.Agent({
  keepAlive: false
})
const httpsAgent = new https.Agent({
  keepAlive: false
})

const options = {
  agent: function (_parsedURL) {
    if (_parsedURL.protocol === 'http:') {
      return httpAgent
    } else {
      return httpsAgent
    }
  }
}
async function riskData (url) {
  return fetch(url, options).then(res => res.json())
}

module.exports = { riskData }
