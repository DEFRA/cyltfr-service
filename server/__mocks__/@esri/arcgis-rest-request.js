class ApplicationCredentialsManager {
  #tokenCount = 0
  correctId
  correctSecret
  token
  expires
  portal
  duration
  _pendingTokenRequest

  constructor (clientId, clientSecret) {
    this.#tokenCount = 0
    this.correctId = clientId === '12345' ? '12345' : 'failed'
    this.correctSecret = clientSecret === 'abc123' ? 'abc123' : 'failed'
    this.token = `1234abcd${this.#tokenCount}`
    this.expires = '2024-07-23T14:22:45.048Z'
    this.portal = 'https://www.arcgis.com/sharing/rest'
    this.duration = 7200
    this._pendingTokenRequest = null
  }

  refreshToken () {
    this.#tokenCount++
    this.token = `1234abcd${this.#tokenCount}`
    return this.token
  }

  static fromCredentials ({ clientId, clientSecret }) {
    return new ApplicationCredentialsManager(clientId, clientSecret)
  }
}

module.exports = { ApplicationCredentialsManager }
