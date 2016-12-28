'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('members-list', {
      url: '/members-list',
      template: '<members-list></members-list>'
    });
}
