const riskQuery = jest.fn()

const result = {
}

const _queryResult = (newResult) => {
  result.data = newResult
}

riskQuery.mockImplementation(() => {
  return Promise.resolve(result.data)
})

module.exports = {
  riskQuery,
  _queryResult
}
