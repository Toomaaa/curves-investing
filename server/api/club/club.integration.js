'use strict';

var app = require('../..');
import request from 'supertest';

var newClub;

describe('Club API:', function() {
  describe('GET /api/clubs', function() {
    var clubs;

    beforeEach(function(done) {
      request(app)
        .get('/api/clubs')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          clubs = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(clubs).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/clubs', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/clubs')
        .send({
          name: 'New Club',
          info: 'This is the brand new club!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newClub = res.body;
          done();
        });
    });

    it('should respond with the newly created club', function() {
      expect(newClub.name).to.equal('New Club');
      expect(newClub.info).to.equal('This is the brand new club!!!');
    });
  });

  describe('GET /api/clubs/:id', function() {
    var club;

    beforeEach(function(done) {
      request(app)
        .get(`/api/clubs/${newClub._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          club = res.body;
          done();
        });
    });

    afterEach(function() {
      club = {};
    });

    it('should respond with the requested club', function() {
      expect(club.name).to.equal('New Club');
      expect(club.info).to.equal('This is the brand new club!!!');
    });
  });

  describe('PUT /api/clubs/:id', function() {
    var updatedClub;

    beforeEach(function(done) {
      request(app)
        .put(`/api/clubs/${newClub._id}`)
        .send({
          name: 'Updated Club',
          info: 'This is the updated club!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedClub = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedClub = {};
    });

    it('should respond with the updated club', function() {
      expect(updatedClub.name).to.equal('Updated Club');
      expect(updatedClub.info).to.equal('This is the updated club!!!');
    });

    it('should respond with the updated club on a subsequent GET', function(done) {
      request(app)
        .get(`/api/clubs/${newClub._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let club = res.body;

          expect(club.name).to.equal('Updated Club');
          expect(club.info).to.equal('This is the updated club!!!');

          done();
        });
    });
  });

  describe('PATCH /api/clubs/:id', function() {
    var patchedClub;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/clubs/${newClub._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Club' },
          { op: 'replace', path: '/info', value: 'This is the patched club!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedClub = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedClub = {};
    });

    it('should respond with the patched club', function() {
      expect(patchedClub.name).to.equal('Patched Club');
      expect(patchedClub.info).to.equal('This is the patched club!!!');
    });
  });

  describe('DELETE /api/clubs/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/clubs/${newClub._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when club does not exist', function(done) {
      request(app)
        .delete(`/api/clubs/${newClub._id}`)
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
