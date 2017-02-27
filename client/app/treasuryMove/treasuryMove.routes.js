'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('treasuryMove', {
      url: '/treasuryMove',
      template: '<treasury-move></treasury-move>'
    });
}
