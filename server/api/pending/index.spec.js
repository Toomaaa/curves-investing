'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var pendingCtrlStub = {
  index: 'pendingCtrl.index',
  show: 'pendingCtrl.show',
  create: 'pendingCtrl.create',
  upsert: 'pendingCtrl.upsert',
  patch: 'pendingCtrl.patch',
  destroy: 'pendingCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var pendingIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './pending.controller': pendingCtrlStub
});

describe('Pending API Router:', function() {
  it('should return an express router instance', function() {
    expect(pendingIndex).to.equal(routerStub);
  });

  describe('GET /api/pendings', function() {
    it('should route to pending.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'pendingCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/pendings/:id', function() {
    it('should route to pending.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'pendingCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/pendings', function() {
    it('should route to pending.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'pendingCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/pendings/:id', function() {
    it('should route to pending.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'pendingCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/pendings/:id', function() {
    it('should route to pending.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'pendingCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/pendings/:id', function() {
    it('should route to pending.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'pendingCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
