var supertest = require('supertest')
var should = require('should')

// This agent refers to PORT where program is runninng.

var server = supertest.agent('http://localhost:3000')

// TODO: proper setup and tear-down of data store/service

// valid-category
describe('GET valid-category', function () {
  it('should return all default valid categories', function (done) {
    server
      .get('/v1/valid-category')
      .expect('Content-type', /json/)
      .expect(200)
      .end(function (err, res) {
        res.status.should.equal(200)
        res.error.should.equal(false)
        res.body.should.be.eql(['OTHER'])
        done()
      })
  })
})

describe('POST valid-category', function () {
  it('should return error when category not defined in payload', function (done) {
    server
      .post('/v1/valid-category')
      .send({ cat: 'Category expected instead of cat'})
      .expect('Content-type', /json/)
      .expect(400)
      .end(function (err, res) {
        res.status.should.equal(400)
        done()
      })
  })
    it('should return error when category is empty', function (done) {
    server
      .post('/v1/valid-category')
      .send({ category: ''})
      .expect('Content-type', /json/)
      .expect(400)
      .end(function (err, res) {
        res.status.should.equal(400)
        done()
      })
  })
  it('should return error when category has more than 200 characters', function (done) {
    server
      .post('/v1/valid-category')
      .send({ category: 'moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200'})
      .expect('Content-type', /json/)
      .expect(400)
      .end(function (err, res) {
        res.status.should.equal(400)
        done()
      })
  })
})

// clean-data
