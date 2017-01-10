'use strict';

describe('Component: WalletComponent', function() {
  // load the controller's module
  beforeEach(module('curvesInvestingApp.wallet'));

  var WalletComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    WalletComponent = $componentController('wallet', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
