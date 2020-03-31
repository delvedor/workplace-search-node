// Licensed to Elasticsearch B.V under one or more agreements.
// Elasticsearch B.V licenses this file to you under the Apache 2.0 License.
// See the LICENSE file in the project root for more information

'use strict'

const assert = require('assert')
const test = require('ava')
const Fastify = require('fastify')
const HttpClient = require('../lib/client')
const { ResponseError, DeserializationError } = require('../lib/errors')
const packageJson = require('../package.json')

const mockAccessToken = 'mockAccessToken'
const expectedHeaders = {
  authorization: `Bearer ${mockAccessToken}`,
  'x-swiftype-client': 'elastic-workplace-search-node',
  'x-swiftype-client-version': packageJson.version
}

test.before(async t => {
  const fastify = Fastify()
  fastify
    .get('/get', async (req, reply) => {
      checkHeaders(req.headers)
      assert.strictEqual(req.query.foo, 'bar')
      return { hello: 'world' }
    })
    .post('/post', async (req, reply) => {
      checkHeaders(req.headers)
      assert.deepStrictEqual(req.body, { foo: 'bar' })
      return { hello: 'world' }
    })
    .all('/error', async (req, reply) => {
      checkHeaders(req.headers)
      reply.code(500)
      return { hello: 'world' }
    })
    .all('/pollution', async (req, reply) => {
      reply.type('application/json')
      return '{"__proto__":{"a":1}}'
    })

  t.context.address = await fastify.listen(0)
  t.context.fastify = fastify

  function checkHeaders (headers) {
    assert.strictEqual(headers.authorization, expectedHeaders.authorization)
    assert.strictEqual(headers['x-swiftype-client'], expectedHeaders['x-swiftype-client'])
    assert.strictEqual(headers['x-swiftype-client-version'], expectedHeaders['x-swiftype-client-version'])
  }
})

test.after(async t => {
  await t.context.fastify.close()
})

test('http client .get', async t => {
  const client = new HttpClient(mockAccessToken, t.context.address)
  const response = await client.get({ path: 'get', query: { foo: 'bar' } })
  t.deepEqual(response, { hello: 'world' })
})

test('.get should handle errors (server error)', async t => {
  const client = new HttpClient(mockAccessToken, t.context.address)
  const error = await t.throwsAsync(client.get({ path: '/error' }))
  t.true(error instanceof ResponseError)
})

test('.get should handle errors (prototype pollution)', async t => {
  const client = new HttpClient(mockAccessToken, t.context.address)
  const error = await t.throwsAsync(client.get({ path: '/pollution' }))
  t.true(error instanceof DeserializationError)
})

test('http client .post', async t => {
  const client = new HttpClient(mockAccessToken, t.context.address)
  const response = await client.post({ path: '/post', payload: { foo: 'bar' } })
  t.deepEqual(response, { hello: 'world' })
})

test('.post should handle errors (server error)', async t => {
  const client = new HttpClient(mockAccessToken, t.context.address)
  const error = await t.throwsAsync(client.post({ path: '/error', payload: { foo: 'bar' } }))
  t.true(error instanceof ResponseError)
})

test('.post should handle errors (prototype pollution)', async t => {
  const client = new HttpClient(mockAccessToken, t.context.address)
  const error = await t.throwsAsync(client.post({ path: '/pollution', payload: { foo: 'bar' } }))
  t.true(error instanceof DeserializationError)
})
