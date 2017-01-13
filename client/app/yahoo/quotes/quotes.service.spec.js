'use strict';

describe('Service: quotes', function() {
  // load the service's module
  beforeEach(module('curvesInvestingApp.quotes'));

  // instantiate service
  var quotes;
  beforeEach(inject(function(_quotes_) {
    quotes = _quotes_;
  }));

  it('should do something', function() {
    expect(!!quotes).to.be.true;
  });
});
