// Licensed to Elasticsearch B.V under one or more agreements.
// Elasticsearch B.V licenses this file to you under the Apache 2.0 License.
// See the LICENSE file in the project root for more information

'use strict'

const got = require('got')
const sjson = require('secure-json-parse')
const { ResponseError, DeserializationError } = require('./errors')
const packageJson = require('../package.json')
const kClient = Symbol('workplace-search-got-client')

class Client {
  constructor (accessToken, baseUrl) {
    this[kClient] = got.extend({
      prefixUrl: baseUrl,
      headers: {
        'X-Swiftype-Client': 'elastic-workplace-search-node',
        'X-Swiftype-Client-Version': packageJson.version,
        Authorization: `Bearer ${accessToken}`
      }
    })
  }

  async get (opts = {}) {
    if (opts.path[0] === '/') opts.path = opts.path.slice(1)
    const response = this[kClient].get(opts.path, { searchParams: opts.query })

    let body = ''
    try {
      body = await response.text()
    } catch (err) {
      const error = new ResponseError(
        err.response.body,
        err.response.statusCode,
        err.response.headers
      )
      throw error
    }

    try {
      body = sjson.parse(body)
    } catch (err) {
      throw new DeserializationError(err.message, body)
    }

    return body
  }

  async post (opts = {}) {
    if (opts.path[0] === '/') opts.path = opts.path.slice(1)
    opts.payload = JSON.stringify(opts.payload)
    const response = this[kClient].post(opts.path, {
      searchParams: opts.query,
      body: opts.payload,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '' + Buffer.byteLength(opts.payload)
      }
    })

    let body = ''
    try {
      body = await response.text()
    } catch (err) {
      const error = new ResponseError(
        err.response.body,
        err.response.statusCode,
        err.response.headers
      )
      throw error
    }

    try {
      body = sjson.parse(body)
    } catch (err) {
      throw new DeserializationError(err.message, body)
    }

    return body
  }
}

module.exports = Client
