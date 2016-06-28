'use strict'

const Hapi = require('hapi')
const Inert = require('inert')
const Vision = require('vision')
const HapiSwagger = require('hapi-swagger')
const Pack = require('./package')
var Joi = require('joi')
const sql = require('mssql')
const _ = require('lodash')

const server = new Hapi.Server()
server.connection({ port: 3000 })

var config = {
  user: 'mode',
  password: '',
  server: 'mode.database.windows.net', 
  database: 'pmos',

  options: {
    encrypt: true // Use this for Windows Azure
  }
}

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply.redirect('/documentation')
  }
})

server.route({
  method: 'POST',
  path: '/v1/clean-data',
  config: {
    handler: function (request, reply) {
      reply('Hello, ' + encodeURIComponent(request.params.input) + '!')
    },
    description: 'Cleans category pair input data',
    notes: 'Removes dublicates category pairs and pairs with a non-valid category. Returns cleaned result and a count of entries.',
    tags: ['api'],
    validate: {
      params: {
        input: Joi.number()
          .required()
          .description('the input data to be cleaned'),
      }
    }
  }
})

server.route({
  method: 'GET',
  path: '/v1/valid-category',
  config: {
    handler: function (request, reply) {
      sql.connect(config).then(function () {
        new sql.Request()
          .query('select [category] from Valid_Category')
          .then(function (recordset) {
            console.dir(recordset)
            return reply(recordset.map((x) => {
              return x.category}))
          }).catch(function (err) {
          // query error checks
          console.error(err)
          return reply(new Error(err.message))
        })
      }).catch(function (err) {
        // sql connection error checks
        console.error(err)
        return reply(new Error(err.message))
      })
    },
    description: 'Lists all valid categories',
    notes: 'Items with non-valid categories are removed ftrom input data.',
    tags: ['api'],
    response: {schema: Joi.array().items(Joi.string().alphanum().min(1).max(200))}
  }
})

server.route({
  method: 'POST',
  path: '/v1/valid-category',
  config: {
    handler: function (request, reply) {
      sql.connect(config).then(function () {
        new sql.Request()
          .input('input_parameter', sql.NVarChar(200), request.payload.category)
          .query('insert into Valid_Category (category) values (@category)')
          .then(function (recordset) {
            console.dir(recordset)
            return reply(recordset.map((x) => {
              return x.category}))
          }).catch(function (err) {
          // query error checks
          console.error(err)
          return reply(new Error(err.message))
        })
      }).catch(function (err) {
        // sql connection error checks
        console.error(err)
        return reply(new Error(err.message))
      })
    },
    description: 'Adds a valid category',
    notes: 'Category must be alfanumeric and have from one to max. 200 characters. The category is persisted in the central database.',
    tags: ['api'],
    validate: {
      payload: {
        category: Joi.string().alphanum().min(1).max(200)
          .required()
          .description('the name for the category'),
      }
    },
    response: { schema: Joi.boolean() }
  }
})

server.route({
  method: 'DELETE',
  path: '/v1/valid-category/{category}',
  config: {
    handler: function (request, reply) {
      console.log(request.params.category)
      // delete vaild-category
      if (true) {
        reply(true)
      } else {
        reply(false)
      }
    },
    description: 'Deletes a valid category',
    notes: 'Deletion happens is the central database. Returns a boolean indicating the success of the deletion',
    tags: ['api'],
    validate: {
      params: {
        category: Joi.string().alphanum().min(1).max(200)
          .required()
          .description('the name for the category to be deleted'),
      }
    },
    response: { schema: Joi.boolean() }
  }
})

server.register([
  Inert,
  Vision,
  {
    register: HapiSwagger,
    options: {
      info: {
        title: 'Data Cleaning Service API Documentation',
        version: Pack.version,
      },
      basePath: '/v1'
    }
  }], (err) => {
  server.start((err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Server running at:', server.info.uri)
    }
  })
})
