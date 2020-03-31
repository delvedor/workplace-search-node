// Licensed to Elasticsearch B.V under one or more agreements.
// Elasticsearch B.V licenses this file to you under the Apache 2.0 License.
// See the LICENSE file in the project root for more information

'use strict'

const Client = require('./client')
const { ConfigurationError } = require('./errors')
const kClient = Symbol('workplace-search-http-client')

class WorkplaceSearchClient {
  constructor (accessToken, baseUrl = 'http://localhost:3002/api/ws/v1') {
    this[kClient] = new Client(accessToken, baseUrl)
  }

  /* GENERATED */
  /**
   * Indexing one or more documents into a custom content source
   * @param {string} opts.content_source_key - Unique key for a Custom API source, provided upon creation of a Custom API Source
   * @param opts.documents
   * @return {response} The API response
   */
  indexDocuments (opts = {}) {
    if (opts.content_source_key !== undefined) {
      const err = new ConfigurationError('Missing required parameter "content_source_key"')
      return Promise.reject(err)
    }
    if (opts.documents !== undefined) {
      const err = new ConfigurationError('Missing required parameter "documents"')
      return Promise.reject(err)
    }
    return this[kClient].post({
      path: `sources/${opts.content_source_key}/documents/bulk_create`,
      query: null,
      payload: opts.documents
    })
  }

  /**
   * Deleting a list of documents from a custom content source
   * @param {string} opts.content_source_key - Unique key for a Custom API source, provided upon creation of a Custom API Source
   * @param opts.document_ids
   * @return {response} The API response
   */
  deleteDocuments (opts = {}) {
    if (opts.content_source_key !== undefined) {
      const err = new ConfigurationError('Missing required parameter "content_source_key"')
      return Promise.reject(err)
    }
    if (opts.document_ids !== undefined) {
      const err = new ConfigurationError('Missing required parameter "document_ids"')
      return Promise.reject(err)
    }
    return this[kClient].post({
      path: `sources/${opts.content_source_key}/documents/bulk_destroy`,
      query: null,
      payload: opts.document_ids
    })
  }

  /**
   * List all permissions for all users
   * @param {string} opts.content_source_key - Unique key for a Custom API source, provided upon creation of a Custom API Source
   * @param {integer} opts.currentPage
   * @param {integer} opts.pageSize
   * @return {response} The API response
   */
  listAllPermissions (opts = {}) {
    if (opts.content_source_key !== undefined) {
      const err = new ConfigurationError('Missing required parameter "content_source_key"')
      return Promise.reject(err)
    }
    return this[kClient].get({
      path: `sources/${opts.content_source_key}/permissions`,
      query: {
        currentPage: opts.currentPage,
        pageSize: opts.pageSize
      }
    })
  }

  /**
   * List all permissions for one users
   * @param {string} opts.content_source_key - Unique key for a Custom API source, provided upon creation of a Custom API Source
   * @param {string} opts.user - The username in context
   * @return {response} The API response
   */
  getUserPermissions (opts = {}) {
    if (opts.content_source_key !== undefined) {
      const err = new ConfigurationError('Missing required parameter "content_source_key"')
      return Promise.reject(err)
    }
    if (opts.user !== undefined) {
      const err = new ConfigurationError('Missing required parameter "user"')
      return Promise.reject(err)
    }
    return this[kClient].get({
      path: `sources/${opts.content_source_key}/permissions/${opts.user}`,
      query: null
    })
  }

  /**
   * Add All Permissions: Create a new set of permissions or over-write all existing permissions
   * @param {string} opts.content_source_key - Unique key for a Custom API source, provided upon creation of a Custom API Source
   * @param {string} opts.user - The username in context
   * @param opts.permissions - Document level security restricts which documents a user is able to return in search results
   * @return {response} The API response
   */
  updateUserPermissions (opts = {}) {
    if (opts.content_source_key !== undefined) {
      const err = new ConfigurationError('Missing required parameter "content_source_key"')
      return Promise.reject(err)
    }
    if (opts.user !== undefined) {
      const err = new ConfigurationError('Missing required parameter "user"')
      return Promise.reject(err)
    }
    if (opts.permissions !== undefined) {
      const err = new ConfigurationError('Missing required parameter "permissions"')
      return Promise.reject(err)
    }
    return this[kClient].post({
      path: `sources/${opts.content_source_key}/permissions/${opts.user}`,
      query: null,
      payload: opts.permissions
    })
  }

  /**
   * Add One Permissions: Add one or more new permissions atop existing permissions
   * @param {string} opts.content_source_key - Unique key for a Custom API source, provided upon creation of a Custom API Source
   * @param {string} opts.user - The username in context
   * @param opts.permissions - Document level security restricts which documents a user is able to return in search results
   * @return {response} The API response
   */
  addUserPermissions (opts = {}) {
    if (opts.content_source_key !== undefined) {
      const err = new ConfigurationError('Missing required parameter "content_source_key"')
      return Promise.reject(err)
    }
    if (opts.user !== undefined) {
      const err = new ConfigurationError('Missing required parameter "user"')
      return Promise.reject(err)
    }
    if (opts.permissions !== undefined) {
      const err = new ConfigurationError('Missing required parameter "permissions"')
      return Promise.reject(err)
    }
    return this[kClient].post({
      path: `sources/${opts.content_source_key}/permissions/${opts.user}/add`,
      query: null,
      payload: opts.permissions
    })
  }

  /**
   * Remove One Permission: Remove one or more permission from an existing set of permissions
   * @param {string} opts.content_source_key - Unique key for a Custom API source, provided upon creation of a Custom API Source
   * @param {string} opts.user - The username in context
   * @param opts.permissions - Document level security restricts which documents a user is able to return in search results
   * @return {response} The API response
   */
  removeUserPermissions (opts = {}) {
    if (opts.content_source_key !== undefined) {
      const err = new ConfigurationError('Missing required parameter "content_source_key"')
      return Promise.reject(err)
    }
    if (opts.user !== undefined) {
      const err = new ConfigurationError('Missing required parameter "user"')
      return Promise.reject(err)
    }
    if (opts.permissions !== undefined) {
      const err = new ConfigurationError('Missing required parameter "permissions"')
      return Promise.reject(err)
    }
    return this[kClient].post({
      path: `sources/${opts.content_source_key}/permissions/${opts.user}/remove`,
      query: null,
      payload: opts.permissions
    })
  }
  /* /GENERATED */
}

module.exports = WorkplaceSearchClient
