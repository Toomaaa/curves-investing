'use strict';

describe('Component: GraphProgressComponent', function() {
  // load the controller's module
  beforeEach(module('curvesInvestingApp.graphProgress'));

  var GraphProgressComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    GraphProgressComponent = $componentController('graphProgress', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
