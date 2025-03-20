import { Response, Request, Headers } from 'node-fetch'

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
const fetch = jest.fn(() => {
  return Promise.resolve(new Response(
    JSON.stringify(downloadDocumentData),
    ResponseInit
  ))
})

export default fetch
export { Headers, Request, Response }
