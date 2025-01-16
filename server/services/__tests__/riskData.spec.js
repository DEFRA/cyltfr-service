const { riskData } = require('../riskData')
jest.mock('../../config')

describe('riskData', () => {
  let x, y

  describe('Calls out to a url', () => {
    test('Runs a fetch', async () => {
      [x, y] = [564228, 263339]
      const result = await riskData(x, y)
      expect(result).toEqual(expect.objectContaining({ data: {} }))
    })
  })
})
