const riskQuery = jest.fn()

const result = {
}

const _queryResult = (newResult) => {
  result.data = newResult
}

const _swData = (newResult) => {
  result.swData = newResult
}

const _rsData = (newResult) => {
  result.rsData = newResult
}

const _resData = (newResult) => {
  result.resData = newResult
}

riskQuery.mockImplementation(() => {
  return Promise.resolve(result.data)
})

const riversAndSeaDepth = jest.fn().mockImplementation(() => {
  return Promise.resolve(result.rsData)
})

const surfaceWaterDepth = jest.fn().mockImplementation(() => {
  return Promise.resolve(result.swData)
})

const reservoirQuery = jest.fn().mockImplementation(() => {
  return Promise.resolve(result.resData)
})

module.exports = {
  riskQuery,
  riversAndSeaDepth,
  surfaceWaterDepth,
  reservoirQuery,
  _queryResult,
  _swData,
  _rsData,
  _resData
}
