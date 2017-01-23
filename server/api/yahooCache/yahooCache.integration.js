'use strict';

var app = require('../..');
import request from 'supertest';

var newYahooCache;

describe('YahooCache API:', function() {
  describe('GET /api/yahooCaches', function() {
    var yahooCaches;

    beforeEach(function(done) {
      request(app)
        .get('/api/yahooCaches')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          yahooCaches = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(yahooCaches).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/yahooCaches', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/yahooCaches')
        .send({
          name: 'New YahooCache',
          info: 'This is the brand new yahooCache!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newYahooCache = res.body;
          done();
        });
    });

    it('should respond with the newly created yahooCache', function() {
      expect(newYahooCache.name).to.equal('New YahooCache');
      expect(newYahooCache.info).to.equal('This is the brand new yahooCache!!!');
    });
  });

  describe('GET /api/yahooCaches/:id', function() {
    var yahooCache;

    beforeEach(function(done) {
      request(app)
        .get(`/api/yahooCaches/${newYahooCache._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          yahooCache = res.body;
          done();
        });
    });

    afterEach(function() {
      yahooCache = {};
    });

    it('should respond with the requested yahooCache', function() {
      expect(yahooCache.name).to.equal('New YahooCache');
      expect(yahooCache.info).to.equal('This is the brand new yahooCache!!!');
    });
  });

  describe('PUT /api/yahooCaches/:id', function() {
    var updatedYahooCache;

    beforeEach(function(done) {
      request(app)
        .put(`/api/yahooCaches/${newYahooCache._id}`)
        .send({
          name: 'Updated YahooCache',
          info: 'This is the updated yahooCache!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedYahooCache = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedYahooCache = {};
    });

    it('should respond with the updated yahooCache', function() {
      expect(updatedYahooCache.name).to.equal('Updated YahooCache');
      expect(updatedYahooCache.info).to.equal('This is the updated yahooCache!!!');
    });

    it('should respond with the updated yahooCache on a subsequent GET', function(done) {
      request(app)
        .get(`/api/yahooCaches/${newYahooCache._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let yahooCache = res.body;

          expect(yahooCache.name).to.equal('Updated YahooCache');
          expect(yahooCache.info).to.equal('This is the updated yahooCache!!!');

          done();
        });
    });
  });

  describe('PATCH /api/yahooCaches/:id', function() {
    var patchedYahooCache;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/yahooCaches/${newYahooCache._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched YahooCache' },
          { op: 'replace', path: '/info', value: 'This is the patched yahooCache!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedYahooCache = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedYahooCache = {};
    });

    it('should respond with the patched yahooCache', function() {
      expect(patchedYahooCache.name).to.equal('Patched YahooCache');
      expect(patchedYahooCache.info).to.equal('This is the patched yahooCache!!!');
    });
  });

  describe('DELETE /api/yahooCaches/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/yahooCaches/${newYahooCache._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when yahooCache does not exist', function(done) {
      request(app)
        .delete(`/api/yahooCaches/${newYahooCache._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
