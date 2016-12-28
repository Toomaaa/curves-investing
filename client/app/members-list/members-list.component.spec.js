'use strict';

describe('Component: MembersListComponent', function() {
  // load the controller's module
  beforeEach(module('curvesInvestingApp.members-list'));

  var MembersListComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    MembersListComponent = $componentController('members-list', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
