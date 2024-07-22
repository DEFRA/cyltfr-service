class ApplicationCredentialsManager {
  static fromCredentials ({ clientId, clientSecret }) {
    const correctId = clientId === '12345' ? '12345' : 'failed'
    const correctSecret = clientSecret === 'abc123' ? 'abc123' : 'failed'
    return {
      correctId,
      correctSecret,
      token: 'abc1234efg',
      expires: '2024-07-23T14:22:45.048Z',
      portal: 'https://www.arcgis.com/sharing/rest',
      duration: 7200,
      _pendingTokenRequest: null,
      refreshToken: () => { '1234abcd' }
    }
  }
}

module.exports = { ApplicationCredentialsManager }
