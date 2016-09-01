'use strict'

const fs = require('fs')
const requireJSON = (path, parse = false) => {   /* simply "require"ing a json file insanely caches it.  This method gets it fresh each time
                                          so we can edit the data to manipulate our responses without reloading the mock-server*/
  if (! /\.json$/.test(path)) {
    path+='.json'
  }
  const data = fs.readFileSync(path, 'utf8')
  return parse ? data : JSON.parse(data)
}

const config = requireJSON('./mymock-config')
const mockServerConf = config.mockServer
const liveServerConf = config.liveServer

const http = require('http')
const https = require('https')
const url = require('url')
const path = require('path')

const makeLiveRequest = (localhost_req, localhost_res, path, headers) => {
  localhost_req.pipe(https.request({
    hostname: liveServerConf.hostname,
    path,
    port: liveServerConf.port,
    method: localhost_req.method,
    headers,
    rejectUnauthorized: false
  }, res => {
    localhost_res.writeHead(res.statusCode, Object.assign({}, res.headers, {
      'responder': 'proxied-by-mymock'
    }))
    res.pipe(localhost_res)
  }))
}

const server = http.createServer( (localhost_req, localhost_res) => {
  let data = {}
  const requestPath = url.parse(localhost_req.url).pathname
  const requestHeaders = localhost_req.headers
  const mockDefinition = mockServerConf.definitions.find( mock => mock.request.path === requestPath )
  const mockData = (() => {
    if (!mockDefinition) return false
    const mockheader = mockDefinition.request.header.toLowerCase() // nodejs lower-cases all incoming HTTP headers
    return requestHeaders.hasOwnProperty(`${mockheader}-fail`) ? mockDefinition.fail : requestHeaders.hasOwnProperty(mockheader) ? mockDefinition : false
  })()

  if (mockData) {
    localhost_res.writeHead(mockData.response.status, {
      'Content-Type': 'application/json',
      'responder': 'mymock'
    })
    localhost_res.end(mockData.response.data && requireJSON(path.join(mockServerConf.dataDir, mockData.response.data), false))
  } else {
    makeLiveRequest(localhost_req, localhost_res, requestPath, requestHeaders)
  }
})

server.listen(mockServerConf.listeningPort, () => {
  console.log(`mymock running on localhost:${mockServerConf.listeningPort}`)
})
