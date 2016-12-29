'use strict';

describe('Service: userSelection', function() {
  // load the service's module
  beforeEach(module('curvesInvestingApp.userSelection'));

  // instantiate service
  var userSelection;
  beforeEach(inject(function(_userSelection_) {
    userSelection = _userSelection_;
  }));

  it('should do something', function() {
    expect(!!userSelection).to.be.true;
  });
});
