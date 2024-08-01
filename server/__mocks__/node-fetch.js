jest.mock('node-fetch')

const { Response, Headers } = jest.requireActual('node-fetch')

const meta = {
  'Content-Type': 'application/json',
  Accept: '*/*'
}
const headers = new Headers(meta)

const ResponseInit = {
  status: 200,
  statusText: 'fail',
  headers
}

const downloadDocumentData = { data: {} }
const getDocList = new Response(
  JSON.stringify(downloadDocumentData),
  ResponseInit
)
const fetch = jest.fn(() => { return Promise.resolve(getDocList) })

module.exports = fetch
