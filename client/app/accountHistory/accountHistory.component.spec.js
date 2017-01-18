'use strict';

describe('Component: AccountHistoryComponent', function() {
  // load the controller's module
  beforeEach(module('curvesInvestingApp.accountHistory'));

  var AccountHistoryComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    AccountHistoryComponent = $componentController('accountHistory', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
