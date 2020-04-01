// Licensed to Elasticsearch B.V under one or more agreements.
// Elasticsearch B.V licenses this file to you under the Apache 2.0 License.
// See the LICENSE file in the project root for more information

'use strict'

const { readFileSync, writeFileSync } = require('fs')
const { join } = require('path')
const refParser = require('@apidevtools/json-schema-ref-parser')
const dedent = require('dedent')

const workplaceSearchFile = join(__dirname, '..', 'index.js')
const workplaceSearchDefFile = join(__dirname, '..', 'index.d.ts')

async function generate () {
  const spec = await refParser.dereference(require(join(__dirname, 'spec.json')))
  const { paths } = spec
  let code = ''
  let interfaces = ''
  let methodDef = ''
  for (const path in paths) {
    for (const method in paths[path]) {
      code += generateMethod(
        paths[path][method].operationId,
        path,
        method,
        paths[path][method]
      )
      code += '\n\n'

      interfaces += await generateInterfaces(
        paths[path][method].operationId,
        path,
        method,
        paths[path][method]
      )
      interfaces += '\n\n'

      methodDef += generateMethodTypeDef(
        paths[path][method].operationId,
        path,
        method,
        paths[path][method]
      )
      methodDef += '\n\n'
    }
  }

  // remove last two line breaks
  code = code.slice(0, -2)
  interfaces = interfaces.slice(0, -2)
  methodDef = methodDef.slice(0, -2)

  const oldFile = readFileSync(workplaceSearchFile, 'utf8')
  const start = oldFile.indexOf('/* GENERATED */')
  const end = oldFile.indexOf('/* /GENERATED */')
  const updatedCode = oldFile.slice(0, start + 15) + '\n' + code + '\n  ' + oldFile.slice(end)
  writeFileSync(
    workplaceSearchFile,
    updatedCode,
    { encoding: 'utf8' }
  )

  let oldDefFile = readFileSync(workplaceSearchDefFile, 'utf8')
  const startInterfaces = oldDefFile.indexOf('/* INTERFACES */')
  const endInterfaces = oldDefFile.indexOf('/* /INTERFACES */')
  const updatedInterfaces = oldDefFile.slice(0, startInterfaces + 16) + '\n' + interfaces + '\n  ' + oldDefFile.slice(endInterfaces)
  writeFileSync(
    workplaceSearchDefFile,
    updatedInterfaces,
    { encoding: 'utf8' }
  )

  oldDefFile = readFileSync(workplaceSearchDefFile, 'utf8')
  const startMethodDef = oldDefFile.indexOf('/* GENERATED */')
  const endMethodDef = oldDefFile.indexOf('/* /GENERATED */')
  const updatedMethodDef = oldDefFile.slice(0, startMethodDef + 15) + '\n' + methodDef + '\n  ' + oldDefFile.slice(endMethodDef)
  writeFileSync(
    workplaceSearchDefFile,
    updatedMethodDef,
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
    }, undefined),
    payload: body ? `opts.${body.paramName}` : undefined
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

async function generateInterfaces (name, url, method, spec) {
  const opts = spec.parameters.reduce((acc, val) => {
    val.paramName = val['x-codegen-param-name'] || val.name
    return acc.concat(val)
  }, [])

  const interfaceName = toPascalCase(name.replace(/_([a-z])/g, k => k[1].toUpperCase()))

  const interfacesDef = {}
  for (const opt of opts) {
    if (opt.type) {
      switch (opt.type) {
        case 'integer':
          interfacesDef[opt.paramName] = 'number'
          break
        default:
          interfacesDef[opt.paramName] = opt.type
      }
    } else {
      interfacesDef[opt.paramName] = opt.schema.type === 'array'
        ? `${interfaceName}Body[]`
        : `${interfaceName}Body`
    }
  }

  const interfacesDefStr = JSON.stringify(interfacesDef, null, 2)
    // split & join to fix the indentation
    .split('\n')
    .join('\n   ')
    // remove useless quotes
    .replace(/"/g, '')
    .replace(/,$/gm, '')

  return dedent`
    export interface ${interfaceName}Params ${interfacesDefStr}
  `
}

function generateMethodTypeDef (name, url, method, spec) {
  return `  ${spec.operationId}(params: ${toPascalCase(name.replace(/_([a-z])/g, k => k[1].toUpperCase()))}Params): Record<string, any>`
}

function toPascalCase (str) {
  return str[0].toUpperCase() + str.slice(1)
}

generate().catch(console.log)
