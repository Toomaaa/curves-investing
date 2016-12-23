'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var clubCtrlStub = {
  index: 'clubCtrl.index',
  show: 'clubCtrl.show',
  create: 'clubCtrl.create',
  upsert: 'clubCtrl.upsert',
  patch: 'clubCtrl.patch',
  destroy: 'clubCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var clubIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './club.controller': clubCtrlStub
});

describe('Club API Router:', function() {
  it('should return an express router instance', function() {
    expect(clubIndex).to.equal(routerStub);
  });

  describe('GET /api/clubs', function() {
    it('should route to club.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'clubCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/clubs/:id', function() {
    it('should route to club.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'clubCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/clubs', function() {
    it('should route to club.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'clubCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/clubs/:id', function() {
    it('should route to club.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'clubCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/clubs/:id', function() {
    it('should route to club.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'clubCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/clubs/:id', function() {
    it('should route to club.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'clubCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
