'use strict';

describe('Service: yahooRequest', function() {
  // load the service's module
  beforeEach(module('curvesInvestingApp.yahooRequest'));

  // instantiate service
  var yahooRequest;
  beforeEach(inject(function(_yahooRequest_) {
    yahooRequest = _yahooRequest_;
  }));

  it('should do something', function() {
    expect(!!yahooRequest).to.be.true;
  });
});
