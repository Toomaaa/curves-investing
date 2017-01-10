'use strict';

describe('Service: quotesName', function() {
  // load the service's module
  beforeEach(module('curvesInvestingApp.quotesName'));

  // instantiate service
  var quotesName;
  beforeEach(inject(function(_quotesName_) {
    quotesName = _quotesName_;
  }));

  it('should do something', function() {
    expect(!!quotesName).to.be.true;
  });
});
