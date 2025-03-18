import http from 'node:http'
import https from 'node:https'
import fetch from 'node-fetch'

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

export { riskData }
