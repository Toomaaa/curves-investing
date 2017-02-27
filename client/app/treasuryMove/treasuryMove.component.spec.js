'use strict';

describe('Component: TreasuryMoveComponent', function() {
  // load the controller's module
  beforeEach(module('curvesInvestingApp.treasuryMove'));

  var TreasuryMoveComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    TreasuryMoveComponent = $componentController('treasuryMove', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
