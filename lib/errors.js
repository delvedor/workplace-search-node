// Licensed to Elasticsearch B.V under one or more agreements.
// Elasticsearch B.V licenses this file to you under the Apache 2.0 License.
// See the LICENSE file in the project root for more information

'use strict'

const { STATUS_CODES } = require('http')

class WorkplaceSearchClientError extends Error {
  constructor (message) {
    super(message)
    this.name = 'WorkplaceSearchClientError'
  }
}

class ResponseError extends WorkplaceSearchClientError {
  constructor (body, statusCode, headers) {
    super('Response Error')
    Error.captureStackTrace(this, ResponseError)
    this.name = 'ResponseError'
    this.message = STATUS_CODES[statusCode]
    this.body = body
    this.statusCode = statusCode
    this.headers = headers
  }
}

class DeserializationError extends WorkplaceSearchClientError {
  constructor (message, data) {
    super(message, data)
    Error.captureStackTrace(this, DeserializationError)
    this.name = 'DeserializationError'
    this.message = message || 'Deserialization Error'
    this.data = data
  }
}

class ConfigurationError extends WorkplaceSearchClientError {
  constructor (message) {
    super(message)
    Error.captureStackTrace(this, ConfigurationError)
    this.name = 'ConfigurationError'
    this.message = message || 'Configuration Error'
  }
}

module.exports = {
  WorkplaceSearchClientError,
  ResponseError,
  DeserializationError,
  ConfigurationError
}
