const query = jest.fn()

const result = {
  rows: []
}

const _queryResult = (newResult) => {
  result.rows = newResult
}

query.mockImplementation(() => {
  return Promise.resolve(result)
})

module.exports = {
  query,
  _queryResult
}
