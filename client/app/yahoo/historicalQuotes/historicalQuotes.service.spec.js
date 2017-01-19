'use strict';

describe('Service: historicalQuotes', function() {
  // load the service's module
  beforeEach(module('curvesInvestingApp.historicalQuotes'));

  // instantiate service
  var historicalQuotes;
  beforeEach(inject(function(_historicalQuotes_) {
    historicalQuotes = _historicalQuotes_;
  }));

  it('should do something', function() {
    expect(!!historicalQuotes).to.be.true;
  });
});
