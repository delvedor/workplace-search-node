// Licensed to Elasticsearch B.V under one or more agreements.
// Elasticsearch B.V licenses this file to you under the Apache 2.0 License.
// See the LICENSE file in the project root for more information

'use strict'

const test = require('ava')
const nock = require('nock')
const WorkplaceSearchClient = require('../lib/workplaceSearch')

const mockAccessToken = 'mockAccessToken'
const mockContentSourceKey = 'mockContentSourceKey'
const mockDocuments = [
  {
    id: 1234,
    title: '5 Tips On Finding A Mentor',
    body:
      'The difference between a budding entrepreneur who merely shows promise and one who is already enjoying some success often comes down to mentoring.',
    url: 'https://www.shopify.com/content/5-tips-on-finding-a-mentor'
  },
  {
    id: 1235,
    title: 'How to Profit from Your Passions',
    body:
      'Want to know the secret to starting a successful business? Find a void and fill it.',
    url: 'https://www.shopify.com/content/how-to-profit-from-your-passions'
  }
]
const clientName = 'elastic-workplace-search-node'
const clientVersion = '0.4.0'

// Mock for Workplace Search client
nock('https://api.swiftype.com/api/ws/v1', {
  reqheaders: {
    authorization: `Bearer ${mockAccessToken}`,
    'x-swiftype-client': clientName,
    'x-swiftype-client-version': clientVersion
  }
})
  .post(`/sources/${mockContentSourceKey}/documents/bulk_create`)
  .reply(200, [
    { id: '1234', errors: [] },
    { id: '1235', errors: [] }
  ])
  .post(`/sources/${mockContentSourceKey}/documents/bulk_destroy`)
  .reply(200, [{ id: 1234, success: true }, { id: 1235, success: true }])
  .get(`/sources/${mockContentSourceKey}/permissions`)
  .reply(200, {
    meta: { page: { current: 1, total_pages: 1, total_results: 2, size: 25 } },
    results: [
      { user: 'enterprise_search2', permissions: [] },
      { user: 'enterprise_search', permissions: [] }
    ]
  })
  .get(`/sources/${mockContentSourceKey}/permissions`)
  .query({ page: { size: 1 } })
  .reply(200, {
    meta: { page: { current: 1, total_pages: 2, total_results: 2, size: 1 } },
    results: [{ user: 'enterprise_search2', permissions: [] }]
  })
  .get(`/sources/${mockContentSourceKey}/permissions`)
  .query({ page: { current: 2 } })
  .reply(200, {
    meta: { page: { current: 2, total_pages: 1, total_results: 2, size: 25 } },
    results: []
  })
  .get(`/sources/${mockContentSourceKey}/permissions`)
  .query({ page: { size: 1, current: 2 } })
  .reply(200, {
    meta: { page: { current: 2, total_pages: 2, total_results: 2, size: 1 } },
    results: [{ user: 'enterprise_search', permissions: [] }]
  })
  .get(`/sources/${mockContentSourceKey}/permissions/enterprise_search`)
  .reply(200, { user: 'enterprise_search', permissions: [] })
  .post(`/sources/${mockContentSourceKey}/permissions/enterprise_search`, {
    permissions: ['permission1']
  })
  .reply(200, { user: 'enterprise_search', permissions: ['permission1'] })
  .post(`/sources/${mockContentSourceKey}/permissions/enterprise_search/add`, {
    permissions: ['permission2']
  })
  .reply(200, {
    user: 'enterprise_search',
    permissions: ['permission1', 'permission2']
  })
  .post(
    `/sources/${mockContentSourceKey}/permissions/enterprise_search/remove`,
    { permissions: ['permission2'] }
  )
  .reply(200, {
    user: 'enterprise_search',
    permissions: ['permission1']
  })

test('.indexDocuments should index documents', async t => {
  const client = new WorkplaceSearchClient(
    mockAccessToken,
    'https://api.swiftype.com/api/ws/v1'
  )
  const results = await client.indexDocuments(
    mockContentSourceKey,
    mockDocuments
  )
  t.deepEqual(results, [
    { id: '1234', errors: [] },
    { id: '1235', errors: [] }
  ])
})

test('.destroyDocuments should destroy documents', async t => {
  const client = new WorkplaceSearchClient(
    mockAccessToken,
    'https://api.swiftype.com/api/ws/v1'
  )
  const results = await client.destroyDocuments(
    mockContentSourceKey,
    mockDocuments.map(doc => doc.id)
  )
  t.deepEqual(results, [
    { id: 1234, success: true },
    { id: 1235, success: true }
  ])
})

test('.listAllPermissions should let permissions', async t => {
  const client = new WorkplaceSearchClient(
    mockAccessToken,
    'https://api.swiftype.com/api/ws/v1'
  )
  const results = await client.listAllPermissions(mockContentSourceKey)
  t.deepEqual(results, {
    meta: {
      page: { current: 1, total_pages: 1, total_results: 2, size: 25 }
    },
    results: [
      { user: 'enterprise_search2', permissions: [] },
      { user: 'enterprise_search', permissions: [] }
    ]
  })
})

test('.listAllPermissions should pass page size', async t => {
  const client = new WorkplaceSearchClient(
    mockAccessToken,
    'https://api.swiftype.com/api/ws/v1'
  )
  const results = await client.listAllPermissions(mockContentSourceKey, {
    pageSize: 1
  })
  t.deepEqual(results, {
    meta: {
      page: { current: 1, total_pages: 2, total_results: 2, size: 1 }
    },
    results: [{ user: 'enterprise_search2', permissions: [] }]
  })
})

test('.listAllPermissions should pass current page', async t => {
  const client = new WorkplaceSearchClient(
    mockAccessToken,
    'https://api.swiftype.com/api/ws/v1'
  )
  const results = await client.listAllPermissions(mockContentSourceKey, {
    currentPage: 2
  })
  t.deepEqual(results, {
    meta: {
      page: { current: 2, total_pages: 1, total_results: 2, size: 25 }
    },
    results: []
  })
})

test('.listAllPermissions should pass page size and current page', async t => {
  const client = new WorkplaceSearchClient(
    mockAccessToken,
    'https://api.swiftype.com/api/ws/v1'
  )
  const results = await client.listAllPermissions(mockContentSourceKey, {
    pageSize: 1,
    currentPage: 2
  })
  t.deepEqual(results, {
    meta: {
      page: { current: 2, total_pages: 2, total_results: 2, size: 1 }
    },
    results: [{ user: 'enterprise_search', permissions: [] }]
  })
})

test('.getUserPermissions', async t => {
  const client = new WorkplaceSearchClient(
    mockAccessToken,
    'https://api.swiftype.com/api/ws/v1'
  )
  const results = await client.getUserPermissions(
    mockContentSourceKey,
    'enterprise_search'
  )
  t.deepEqual(results, { user: 'enterprise_search', permissions: [] })
})

test('.updateUserPermissions', async t => {
  const client = new WorkplaceSearchClient(
    mockAccessToken,
    'https://api.swiftype.com/api/ws/v1'
  )
  const results = await client.updateUserPermissions(
    mockContentSourceKey,
    'enterprise_search',
    { permissions: ['permission1'] }
  )
  t.deepEqual(results, {
    user: 'enterprise_search',
    permissions: ['permission1']
  })
})

test('.addUserPermissions', async t => {
  const client = new WorkplaceSearchClient(
    mockAccessToken,
    'https://api.swiftype.com/api/ws/v1'
  )
  const results = await client.addUserPermissions(
    mockContentSourceKey,
    'enterprise_search',
    { permissions: ['permission2'] }
  )
  t.deepEqual(results, {
    user: 'enterprise_search',
    permissions: ['permission1', 'permission2']
  })
})

test('removeUserPermissions', async t => {
  const client = new WorkplaceSearchClient(
    mockAccessToken,
    'https://api.swiftype.com/api/ws/v1'
  )
  const results = await client.removeUserPermissions(
    mockContentSourceKey,
    'enterprise_search',
    { permissions: ['permission2'] }
  )
  t.deepEqual(results, {
    user: 'enterprise_search',
    permissions: ['permission1']
  })
})
