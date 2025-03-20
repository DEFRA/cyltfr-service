const dataConfig = {
  env: 'test',
  port: 3000,
  host: '0.0.0.0',
  dataVersion: 'test',
  standAlone: false,
  awsBucketRegion: 'us-west-2',
  awsBucketName: 'my-bucket',
  holdingCommentsPrefix: 'holding-comments',
  manifestFilename: 'manifest.json',
  performanceLogging: false,
  setConfigOptions: function (newValues) {
    Object.keys(newValues).forEach(function (key) {
      dataConfig[key] = newValues[key]
    })
  }
}

export { dataConfig }
