'use strict';

var app = require('../..');
import request from 'supertest';

var newClubsPeriods;

describe('ClubsPeriods API:', function() {
  describe('GET /api/clubsPeriods', function() {
    var clubsPeriodss;

    beforeEach(function(done) {
      request(app)
        .get('/api/clubsPeriods')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          clubsPeriodss = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(clubsPeriodss).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/clubsPeriods', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/clubsPeriods')
        .send({
          name: 'New ClubsPeriods',
          info: 'This is the brand new clubsPeriods!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newClubsPeriods = res.body;
          done();
        });
    });

    it('should respond with the newly created clubsPeriods', function() {
      expect(newClubsPeriods.name).to.equal('New ClubsPeriods');
      expect(newClubsPeriods.info).to.equal('This is the brand new clubsPeriods!!!');
    });
  });

  describe('GET /api/clubsPeriods/:id', function() {
    var clubsPeriods;

    beforeEach(function(done) {
      request(app)
        .get(`/api/clubsPeriods/${newClubsPeriods._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          clubsPeriods = res.body;
          done();
        });
    });

    afterEach(function() {
      clubsPeriods = {};
    });

    it('should respond with the requested clubsPeriods', function() {
      expect(clubsPeriods.name).to.equal('New ClubsPeriods');
      expect(clubsPeriods.info).to.equal('This is the brand new clubsPeriods!!!');
    });
  });

  describe('PUT /api/clubsPeriods/:id', function() {
    var updatedClubsPeriods;

    beforeEach(function(done) {
      request(app)
        .put(`/api/clubsPeriods/${newClubsPeriods._id}`)
        .send({
          name: 'Updated ClubsPeriods',
          info: 'This is the updated clubsPeriods!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedClubsPeriods = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedClubsPeriods = {};
    });

    it('should respond with the updated clubsPeriods', function() {
      expect(updatedClubsPeriods.name).to.equal('Updated ClubsPeriods');
      expect(updatedClubsPeriods.info).to.equal('This is the updated clubsPeriods!!!');
    });

    it('should respond with the updated clubsPeriods on a subsequent GET', function(done) {
      request(app)
        .get(`/api/clubsPeriods/${newClubsPeriods._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let clubsPeriods = res.body;

          expect(clubsPeriods.name).to.equal('Updated ClubsPeriods');
          expect(clubsPeriods.info).to.equal('This is the updated clubsPeriods!!!');

          done();
        });
    });
  });

  describe('PATCH /api/clubsPeriods/:id', function() {
    var patchedClubsPeriods;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/clubsPeriods/${newClubsPeriods._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched ClubsPeriods' },
          { op: 'replace', path: '/info', value: 'This is the patched clubsPeriods!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedClubsPeriods = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedClubsPeriods = {};
    });

    it('should respond with the patched clubsPeriods', function() {
      expect(patchedClubsPeriods.name).to.equal('Patched ClubsPeriods');
      expect(patchedClubsPeriods.info).to.equal('This is the patched clubsPeriods!!!');
    });
  });

  describe('DELETE /api/clubsPeriods/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/clubsPeriods/${newClubsPeriods._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when clubsPeriods does not exist', function(done) {
      request(app)
        .delete(`/api/clubsPeriods/${newClubsPeriods._id}`)
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
