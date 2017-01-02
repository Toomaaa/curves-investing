'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var clubsPeriodsCtrlStub = {
  index: 'clubsPeriodsCtrl.index',
  show: 'clubsPeriodsCtrl.show',
  create: 'clubsPeriodsCtrl.create',
  upsert: 'clubsPeriodsCtrl.upsert',
  patch: 'clubsPeriodsCtrl.patch',
  destroy: 'clubsPeriodsCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var clubsPeriodsIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './clubsPeriods.controller': clubsPeriodsCtrlStub
});

describe('ClubsPeriods API Router:', function() {
  it('should return an express router instance', function() {
    expect(clubsPeriodsIndex).to.equal(routerStub);
  });

  describe('GET /api/clubsPeriods', function() {
    it('should route to clubsPeriods.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'clubsPeriodsCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/clubsPeriods/:id', function() {
    it('should route to clubsPeriods.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'clubsPeriodsCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/clubsPeriods', function() {
    it('should route to clubsPeriods.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'clubsPeriodsCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/clubsPeriods/:id', function() {
    it('should route to clubsPeriods.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'clubsPeriodsCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/clubsPeriods/:id', function() {
    it('should route to clubsPeriods.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'clubsPeriodsCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/clubsPeriods/:id', function() {
    it('should route to clubsPeriods.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'clubsPeriodsCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
