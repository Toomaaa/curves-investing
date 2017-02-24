'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var graphProgressCtrlStub = {
  index: 'graphProgressCtrl.index',
  show: 'graphProgressCtrl.show',
  create: 'graphProgressCtrl.create',
  upsert: 'graphProgressCtrl.upsert',
  patch: 'graphProgressCtrl.patch',
  destroy: 'graphProgressCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var graphProgressIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './graphProgress.controller': graphProgressCtrlStub
});

describe('GraphProgress API Router:', function() {
  it('should return an express router instance', function() {
    expect(graphProgressIndex).to.equal(routerStub);
  });

  describe('GET /api/graphProgress', function() {
    it('should route to graphProgress.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'graphProgressCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/graphProgress/:id', function() {
    it('should route to graphProgress.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'graphProgressCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/graphProgress', function() {
    it('should route to graphProgress.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'graphProgressCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/graphProgress/:id', function() {
    it('should route to graphProgress.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'graphProgressCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/graphProgress/:id', function() {
    it('should route to graphProgress.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'graphProgressCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/graphProgress/:id', function() {
    it('should route to graphProgress.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'graphProgressCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
