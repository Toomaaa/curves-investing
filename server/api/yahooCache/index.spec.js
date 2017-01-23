'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var yahooCacheCtrlStub = {
  index: 'yahooCacheCtrl.index',
  show: 'yahooCacheCtrl.show',
  create: 'yahooCacheCtrl.create',
  upsert: 'yahooCacheCtrl.upsert',
  patch: 'yahooCacheCtrl.patch',
  destroy: 'yahooCacheCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var yahooCacheIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './yahooCache.controller': yahooCacheCtrlStub
});

describe('YahooCache API Router:', function() {
  it('should return an express router instance', function() {
    expect(yahooCacheIndex).to.equal(routerStub);
  });

  describe('GET /api/yahooCaches', function() {
    it('should route to yahooCache.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'yahooCacheCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/yahooCaches/:id', function() {
    it('should route to yahooCache.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'yahooCacheCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/yahooCaches', function() {
    it('should route to yahooCache.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'yahooCacheCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/yahooCaches/:id', function() {
    it('should route to yahooCache.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'yahooCacheCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/yahooCaches/:id', function() {
    it('should route to yahooCache.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'yahooCacheCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/yahooCaches/:id', function() {
    it('should route to yahooCache.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'yahooCacheCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
