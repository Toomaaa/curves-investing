'use strict';

var app = require('../..');
import request from 'supertest';

var newPending;

describe('Pending API:', function() {
  describe('GET /api/pendings', function() {
    var pendings;

    beforeEach(function(done) {
      request(app)
        .get('/api/pendings')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          pendings = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(pendings).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/pendings', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/pendings')
        .send({
          name: 'New Pending',
          info: 'This is the brand new pending!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newPending = res.body;
          done();
        });
    });

    it('should respond with the newly created pending', function() {
      expect(newPending.name).to.equal('New Pending');
      expect(newPending.info).to.equal('This is the brand new pending!!!');
    });
  });

  describe('GET /api/pendings/:id', function() {
    var pending;

    beforeEach(function(done) {
      request(app)
        .get(`/api/pendings/${newPending._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          pending = res.body;
          done();
        });
    });

    afterEach(function() {
      pending = {};
    });

    it('should respond with the requested pending', function() {
      expect(pending.name).to.equal('New Pending');
      expect(pending.info).to.equal('This is the brand new pending!!!');
    });
  });

  describe('PUT /api/pendings/:id', function() {
    var updatedPending;

    beforeEach(function(done) {
      request(app)
        .put(`/api/pendings/${newPending._id}`)
        .send({
          name: 'Updated Pending',
          info: 'This is the updated pending!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedPending = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPending = {};
    });

    it('should respond with the updated pending', function() {
      expect(updatedPending.name).to.equal('Updated Pending');
      expect(updatedPending.info).to.equal('This is the updated pending!!!');
    });

    it('should respond with the updated pending on a subsequent GET', function(done) {
      request(app)
        .get(`/api/pendings/${newPending._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let pending = res.body;

          expect(pending.name).to.equal('Updated Pending');
          expect(pending.info).to.equal('This is the updated pending!!!');

          done();
        });
    });
  });

  describe('PATCH /api/pendings/:id', function() {
    var patchedPending;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/pendings/${newPending._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Pending' },
          { op: 'replace', path: '/info', value: 'This is the patched pending!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedPending = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedPending = {};
    });

    it('should respond with the patched pending', function() {
      expect(patchedPending.name).to.equal('Patched Pending');
      expect(patchedPending.info).to.equal('This is the patched pending!!!');
    });
  });

  describe('DELETE /api/pendings/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/pendings/${newPending._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when pending does not exist', function(done) {
      request(app)
        .delete(`/api/pendings/${newPending._id}`)
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
