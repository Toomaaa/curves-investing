'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var treasuryMoveCtrlStub = {
  index: 'treasuryMoveCtrl.index',
  show: 'treasuryMoveCtrl.show',
  create: 'treasuryMoveCtrl.create',
  upsert: 'treasuryMoveCtrl.upsert',
  patch: 'treasuryMoveCtrl.patch',
  destroy: 'treasuryMoveCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var treasuryMoveIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './treasuryMove.controller': treasuryMoveCtrlStub
});

describe('TreasuryMove API Router:', function() {
  it('should return an express router instance', function() {
    expect(treasuryMoveIndex).to.equal(routerStub);
  });

  describe('GET /api/treasuryMoves', function() {
    it('should route to treasuryMove.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'treasuryMoveCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/treasuryMoves/:id', function() {
    it('should route to treasuryMove.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'treasuryMoveCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/treasuryMoves', function() {
    it('should route to treasuryMove.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'treasuryMoveCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/treasuryMoves/:id', function() {
    it('should route to treasuryMove.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'treasuryMoveCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/treasuryMoves/:id', function() {
    it('should route to treasuryMove.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'treasuryMoveCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/treasuryMoves/:id', function() {
    it('should route to treasuryMove.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'treasuryMoveCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
