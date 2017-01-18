'use strict';

describe('Component: TreasuryComponent', function() {
  // load the controller's module
  beforeEach(module('curvesInvestingApp.treasury'));

  var TreasuryComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    TreasuryComponent = $componentController('treasury', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
