// Licensed to Elasticsearch B.V under one or more agreements.
// Elasticsearch B.V licenses this file to you under the Apache 2.0 License.
// See the LICENSE file in the project root for more information

'use strict'

const { readFileSync, writeFileSync } = require('fs')
const { join } = require('path')
const refParser = require('@apidevtools/json-schema-ref-parser')
const dedent = require('dedent')

const workplaceSearchFile = join(__dirname, '..', 'index.js')

async function generate () {
  const spec = await refParser.dereference(require(join(__dirname, 'spec.json')))
  const { paths } = spec
  let code = ''
  for (const path in paths) {
    for (const method in paths[path]) {
      code += generateMethod(
        paths[path][method].operationId,
        path,
        method,
        paths[path][method]
      )
      code += '\n\n'
    }
  }

  // remove last two line breaks
  code = code.slice(0, -2)

  const oldFile = readFileSync(workplaceSearchFile, 'utf8')
  const start = oldFile.indexOf('/* GENERATED */')
  const end = oldFile.indexOf('/* /GENERATED */')
  const updatedCode = oldFile.slice(0, start + 15) + '\n' + code + '\n  ' + oldFile.slice(end)
  writeFileSync(
    workplaceSearchFile,
    updatedCode,
    { encoding: 'utf8' }
  )
}

function generateMethod (name, url, method, spec) {
  const path = spec.parameters.reduce((acc, val) => {
    if (val.in !== 'path') return acc
    val.paramName = val['x-codegen-param-name'] || val.name
    return acc.concat(val)
  }, [])
  const query = spec.parameters.reduce((acc, val) => {
    if (val.in !== 'query') return acc
    val.paramName = val['x-codegen-param-name'] || val.name
    return acc.concat(val)
  }, [])
  const body = spec.parameters.reduce((acc, val) => {
    if (val.in !== 'body') return acc
    val.paramName = val['x-codegen-param-name'] || val.name
    return val
  }, null)

  const docs = path.concat(query).concat(body || [])
    .map(val => {
      return `@param${val.type ? ' {' + val.type + '}' : ''} opts.${val.paramName}${val.description ? ' - ' + val.description : ''}`
    })
    .join('\n* ')

  const pathCopy = JSON.parse(JSON.stringify(path))
  let parsedPath = url
    .split('/')
    .map(chunk => {
      if (!chunk.startsWith('{')) return chunk
      const val = pathCopy.shift()
      return '${' + `opts.${val.paramName}` + '}'
    })
    .join('/')

  if (parsedPath[0] === '/') parsedPath = parsedPath.slice(1)

  const request = {
    path: '`' + parsedPath + '`',
    query: query.reduce((acc, val) => {
      acc = acc || {}
      acc[val.paramName] = `opts.${val.paramName}`
      return acc
    }, null)
  }

  if (method === 'post') {
    request.payload = `opts.${body.paramName}`
  }

  const requestStr = JSON.stringify(request, null, 2)
    // split & join to fix the indentation
    .split('\n')
    .join('\n      ')
    // remove useless quotes
    .replace(/"/g, '')

  let code = dedent`
    /**
     * ${spec.summary}
     * ${docs}
     * @return {response} The API response
     */
    ${name} (opts = {}) {
      ${buildValidation(path.concat(query).concat(body))}
      return this[kClient].${method}(${requestStr})
    }
  `

  // fix indentation
  code = code
    .split('\n')
    .map(line => `  ${line}`)
    .join('\n')

  // fix comments indentation
  code = code.replace(/^\s{2}\*/gm, '   *')

  return code

  function buildValidation (params) {
    let code = ''
    for (const param of params) {
      if (param == null || param.required !== true) continue
      code += `
      if (opts.${param.name} !== undefined) {
        const err = new ConfigurationError('Missing required parameter "${param.name}"')
        return Promise.reject(err)
      }`
    }
    return code.trim()
  }
}

generate().catch(console.log)
