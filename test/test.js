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
        res.body.should.containDeep(['PERSON', 'PLACE', 'ANIMAL', 'COMPUTER', 'OTHER'])
        done()
      })
  })
})

describe('POST valid-category', function () {
  it('should return error when category not defined in payload', function (done) {
    server
      .post('/v1/valid-category')
      .send({ cat: 'Category expected instead of cat' })
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
      .send({ category: '' })
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
      .send({ category: 'moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200moreThan200' })
      .expect('Content-type', /json/)
      .expect(400)
      .end(function (err, res) {
        res.status.should.equal(400)
        done()
      })
  })
  it('should return true with a valid category', function (done) {
    server
      .post('/v1/valid-category')
      .send({ category: 'TESTCATEGORY' })
      .expect('Content-type', /json/)
      .expect(200)
      .end(function (err, res) {
        res.status.should.equal(200)
        res.body.should.be.eql(true)
        done()
      })
  })
})

describe('DELETE valid-category', function () {
  it('should return true when deleting test_category', function (done) {
    server
      .del('/v1/valid-category/TESTCATEGORY')
      .expect('Content-type', /json/)
      .expect(400)
      .end(function (err, res) {
        res.status.should.equal(200)
        res.body.should.be.eql(true)
        done()
      })
  })
})

// clean-data

describe('POST clean-data', function () {
  const testInputData = [
    {category: 'PERSON', subcategory: 'Bob Jones'},
    {category: 'PLACE', subcategory: 'Washington'},
    {category: 'PERSON', subcategory: 'Mary'},
    {category: 'COMPUTER', subcategory: 'Mac'},
    {category: 'PERSON', subcategory: 'Bob Jones'},
    {category: 'OTHER', subcategory: 'Tree'},
    {category: 'ANIMAL', subcategory: 'Dog'},
    {category: 'PLACE', subcategory: 'Texas'},
    {category: 'FOOD', subcategory: 'Steak'},
    {category: 'ANIMAL', subcategory: 'Cat'},
    {category: 'PERSON', subcategory: 'Mac'}
  ]
  const outputData = [
    {category: 'PERSON', subcategory: 'Bob Jones'},
    {category: 'PLACE', subcategory: 'Washington'},
    {category: 'PERSON', subcategory: 'Mary'},
    {category: 'COMPUTER', subcategory: 'Mac'},
    {category: 'OTHER', subcategory: 'Tree'},
    {category: 'ANIMAL', subcategory: 'Dog'},
    {category: 'PLACE', subcategory: 'Texas'},
    {category: 'ANIMAL', subcategory: 'Cat'},
    {category: 'PERSON', subcategory: 'Mac'}
  ]
  const countData = [
    {category: 'PERSON', count: 3},
    {category: 'PLACE', count: 2},
    {category: 'ANIMAL', count: 2},
    {category: 'COMPUTER', count: 1},
    {category: 'OTHER', count: 1}
  ]
  it('should return cleaned output and category count', function (done) {
    server
      .post('/v1/clean-data')
      .send({ inputdata: testInputData })
      .expect('Content-type', /json/)
      .expect(200)
      .end(function (err, res) {
        res.status.should.equal(200)
        res.body.output.should.be.eql(outputData)
        res.body.count.should.containDeep(countData)
        done()
      })
  })
})
