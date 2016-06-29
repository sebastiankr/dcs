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

var config = require('./config.json')[process.env.NODE_ENV || 'dev']

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
      sql.connect(config.db).then(function () {
        new sql.Request()
          .query('select [category] from Valid_Category')
          .then(function (recordset) {
            const validCategories = recordset.map((x) => {
              return x.category
            })
            const outputData = []
            const countData = {}
            request.payload.inputdata.map((x) => {
              if (_.includes(validCategories, x.category)) {
                if (!_.find(outputData, (y) => {
                    return x.category === y.category && x.subcategory === y.subcategory
                  })) {
                  outputData.push(x)
                  if (countData[x.category]) {
                    countData[x.category]++
                  } else {
                    countData[x.category] = 1
                  }
                }
              }
            })

            let result = {
              output: outputData,
              count: []
            }
            _.forEach(countData, (value, key) => {
              result.count.push({ category: key, count: value })
            })
            return reply(result)
          })
          .catch(function (err) {
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
    description: 'Cleans category pair input data',
    notes: 'Removes dublicates category pairs and pairs with a non-valid category. Returns cleaned result and a count of entries.',
    tags: ['api'],
    validate: {
      payload: {
        inputdata: Joi.array().items(Joi.object().keys({
          category: Joi.string().min(1).max(200),
          subcategory: Joi.string().min(1).max(200)
        }))
          .required()
          .description('the input data to be cleaned')
      }
    },
    response: {
      schema: Joi.object().keys({
        output: Joi.array().items(
          Joi.object().keys({
            category: Joi.string().min(1).max(200),
            subcategory: Joi.string().min(1).max(200)
          })
        ),
        count: Joi.array().items(
          Joi.object().keys({
            category: Joi.string().min(1).max(200),
            count: Joi.number()
          })
        )
      })
    }
  }
})

server.route({
  method: 'GET',
  path: '/v1/valid-category',
  config: {
    handler: function (request, reply) {
      sql.connect(config.db).then(function () {
        new sql.Request()
          .query('select [category] from Valid_Category')
          .then(function (recordset) {
            return reply(recordset.map((x) => {
              return x.category
            }))
          })
          .catch(function (err) {
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
    response: {schema: Joi.array().items(Joi.string().min(1).max(200))}
  }
})

server.route({
  method: 'POST',
  path: '/v1/valid-category',
  config: {
    handler: function (request, reply) {
      sql.connect(config.db).then(function () {
        new sql.Request()
          .input('category', sql.NVarChar(200), request.payload.category)
          .query('insert into Valid_Category (category) values (@category)')
          .then(function (recordset) {
            return reply(true)
          })
          .catch(function (err) {
            // query error checks
            console.error(err)
            return reply(false)
          })
      }).catch(function (err) {
        // sql connection error checks
        console.error(err)
        return reply(new Error(err.message))
      })
    },
    description: 'Adds a valid category',
    notes: 'Category must be a string and have from one to max. 200 characters. The category is persisted in the central database.',
    tags: ['api'],
    validate: {
      payload: {
        category: Joi.string().min(1).max(200)
          .required()
          .description('the name for the category')
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
      sql.connect(config.db).then(function () {
        new sql.Request()
          .input('category', sql.NVarChar(200), request.params.category)
          .query('delete from Valid_Category WHERE category = @category')
          .then(function (recordset) {
            return reply(true)
          })
          .catch(function (err) {
            // query error checks
            console.error(err)
            return reply(false)
          })
      }).catch(function (err) {
        // sql connection error checks
        console.error(err)
        return reply(new Error(err.message))
      })
    },
    description: 'Deletes a valid category',
    notes: 'Deletion happens is the central database. Returns a boolean indicating the success of the deletion',
    tags: ['api'],
    validate: {
      params: {
        category: Joi.string().min(1).max(200)
          .required()
          .description('the name for the category to be deleted')
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
        version: Pack.version
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
