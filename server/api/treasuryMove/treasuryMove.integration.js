'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newTreasuryMove;

describe('TreasuryMove API:', function() {
  describe('GET /api/treasuryMoves', function() {
    var treasuryMoves;

    beforeEach(function(done) {
      request(app)
        .get('/api/treasuryMoves')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          treasuryMoves = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(treasuryMoves).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/treasuryMoves', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/treasuryMoves')
        .send({
          name: 'New TreasuryMove',
          info: 'This is the brand new treasuryMove!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newTreasuryMove = res.body;
          done();
        });
    });

    it('should respond with the newly created treasuryMove', function() {
      expect(newTreasuryMove.name).to.equal('New TreasuryMove');
      expect(newTreasuryMove.info).to.equal('This is the brand new treasuryMove!!!');
    });
  });

  describe('GET /api/treasuryMoves/:id', function() {
    var treasuryMove;

    beforeEach(function(done) {
      request(app)
        .get(`/api/treasuryMoves/${newTreasuryMove._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          treasuryMove = res.body;
          done();
        });
    });

    afterEach(function() {
      treasuryMove = {};
    });

    it('should respond with the requested treasuryMove', function() {
      expect(treasuryMove.name).to.equal('New TreasuryMove');
      expect(treasuryMove.info).to.equal('This is the brand new treasuryMove!!!');
    });
  });

  describe('PUT /api/treasuryMoves/:id', function() {
    var updatedTreasuryMove;

    beforeEach(function(done) {
      request(app)
        .put(`/api/treasuryMoves/${newTreasuryMove._id}`)
        .send({
          name: 'Updated TreasuryMove',
          info: 'This is the updated treasuryMove!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedTreasuryMove = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedTreasuryMove = {};
    });

    it('should respond with the updated treasuryMove', function() {
      expect(updatedTreasuryMove.name).to.equal('Updated TreasuryMove');
      expect(updatedTreasuryMove.info).to.equal('This is the updated treasuryMove!!!');
    });

    it('should respond with the updated treasuryMove on a subsequent GET', function(done) {
      request(app)
        .get(`/api/treasuryMoves/${newTreasuryMove._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let treasuryMove = res.body;

          expect(treasuryMove.name).to.equal('Updated TreasuryMove');
          expect(treasuryMove.info).to.equal('This is the updated treasuryMove!!!');

          done();
        });
    });
  });

  describe('PATCH /api/treasuryMoves/:id', function() {
    var patchedTreasuryMove;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/treasuryMoves/${newTreasuryMove._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched TreasuryMove' },
          { op: 'replace', path: '/info', value: 'This is the patched treasuryMove!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedTreasuryMove = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedTreasuryMove = {};
    });

    it('should respond with the patched treasuryMove', function() {
      expect(patchedTreasuryMove.name).to.equal('Patched TreasuryMove');
      expect(patchedTreasuryMove.info).to.equal('This is the patched treasuryMove!!!');
    });
  });

  describe('DELETE /api/treasuryMoves/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/treasuryMoves/${newTreasuryMove._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when treasuryMove does not exist', function(done) {
      request(app)
        .delete(`/api/treasuryMoves/${newTreasuryMove._id}`)
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
