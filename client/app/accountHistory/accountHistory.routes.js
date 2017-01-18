'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('accountHistory', {
      url: '/accountHistory',
      template: '<account-history></account-history>'
    });
}
