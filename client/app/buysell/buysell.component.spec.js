'use strict';

describe('Component: BuysellComponent', function() {
  // load the controller's module
  beforeEach(module('curvesInvestingApp.buysell'));

  var BuysellComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    BuysellComponent = $componentController('buysell', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
