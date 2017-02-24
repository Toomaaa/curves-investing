'use strict';

var app = require('../..');
import request from 'supertest';

var newGraphProgress;

describe('GraphProgress API:', function() {
  describe('GET /api/graphProgress', function() {
    var graphProgresss;

    beforeEach(function(done) {
      request(app)
        .get('/api/graphProgress')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          graphProgresss = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(graphProgresss).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/graphProgress', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/graphProgress')
        .send({
          name: 'New GraphProgress',
          info: 'This is the brand new graphProgress!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newGraphProgress = res.body;
          done();
        });
    });

    it('should respond with the newly created graphProgress', function() {
      expect(newGraphProgress.name).to.equal('New GraphProgress');
      expect(newGraphProgress.info).to.equal('This is the brand new graphProgress!!!');
    });
  });

  describe('GET /api/graphProgress/:id', function() {
    var graphProgress;

    beforeEach(function(done) {
      request(app)
        .get(`/api/graphProgress/${newGraphProgress._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          graphProgress = res.body;
          done();
        });
    });

    afterEach(function() {
      graphProgress = {};
    });

    it('should respond with the requested graphProgress', function() {
      expect(graphProgress.name).to.equal('New GraphProgress');
      expect(graphProgress.info).to.equal('This is the brand new graphProgress!!!');
    });
  });

  describe('PUT /api/graphProgress/:id', function() {
    var updatedGraphProgress;

    beforeEach(function(done) {
      request(app)
        .put(`/api/graphProgress/${newGraphProgress._id}`)
        .send({
          name: 'Updated GraphProgress',
          info: 'This is the updated graphProgress!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedGraphProgress = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedGraphProgress = {};
    });

    it('should respond with the updated graphProgress', function() {
      expect(updatedGraphProgress.name).to.equal('Updated GraphProgress');
      expect(updatedGraphProgress.info).to.equal('This is the updated graphProgress!!!');
    });

    it('should respond with the updated graphProgress on a subsequent GET', function(done) {
      request(app)
        .get(`/api/graphProgress/${newGraphProgress._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let graphProgress = res.body;

          expect(graphProgress.name).to.equal('Updated GraphProgress');
          expect(graphProgress.info).to.equal('This is the updated graphProgress!!!');

          done();
        });
    });
  });

  describe('PATCH /api/graphProgress/:id', function() {
    var patchedGraphProgress;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/graphProgress/${newGraphProgress._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched GraphProgress' },
          { op: 'replace', path: '/info', value: 'This is the patched graphProgress!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedGraphProgress = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedGraphProgress = {};
    });

    it('should respond with the patched graphProgress', function() {
      expect(patchedGraphProgress.name).to.equal('Patched GraphProgress');
      expect(patchedGraphProgress.info).to.equal('This is the patched graphProgress!!!');
    });
  });

  describe('DELETE /api/graphProgress/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/graphProgress/${newGraphProgress._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when graphProgress does not exist', function(done) {
      request(app)
        .delete(`/api/graphProgress/${newGraphProgress._id}`)
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
