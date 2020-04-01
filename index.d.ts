// Licensed to Elasticsearch B.V under one or more agreements.
// Elasticsearch B.V licenses this file to you under the Apache 2.0 License.
// See the LICENSE file in the project root for more information

/* INTERFACES */
export interface IndexDocumentsParams {
  content_source_key: string
  documents: IndexDocumentsBody[]
}

export interface DeleteDocumentsParams {
  content_source_key: string
  document_ids: DeleteDocumentsBody[]
}

export interface ListAllPermissionsParams {
  content_source_key: string
  currentPage: number
  pageSize: number
}

export interface GetUserPermissionsParams {
  content_source_key: string
  user: string
}

export interface UpdateUserPermissionsParams {
  content_source_key: string
  user: string
  permissions: UpdateUserPermissionsBody[]
}

export interface AddUserPermissionsParams {
  content_source_key: string
  user: string
  permissions: AddUserPermissionsBody[]
}

export interface RemoveUserPermissionsParams {
  content_source_key: string
  user: string
  permissions: RemoveUserPermissionsBody[]
}
  /* /INTERFACES */

type IndexDocumentsBody = Document
type DeleteDocumentsBody = string
type UpdateUserPermissionsBody = string
type AddUserPermissionsBody = string
type RemoveUserPermissionsBody = string

interface Document {
  id?: string
  title: string
  body: string
  url: string
  _allow_permissions?: string[]
  _deny_permissions?: string[]
}

export default class Client {
  constructor(accessToken: string, baseUrl?: string)
  /* GENERATED */
  indexDocuments(params: IndexDocumentsParams): Record<string, any>

  deleteDocuments(params: DeleteDocumentsParams): Record<string, any>

  listAllPermissions(params: ListAllPermissionsParams): Record<string, any>

  getUserPermissions(params: GetUserPermissionsParams): Record<string, any>

  updateUserPermissions(params: UpdateUserPermissionsParams): Record<string, any>

  addUserPermissions(params: AddUserPermissionsParams): Record<string, any>

  removeUserPermissions(params: RemoveUserPermissionsParams): Record<string, any>
  /* /GENERATED */
}
