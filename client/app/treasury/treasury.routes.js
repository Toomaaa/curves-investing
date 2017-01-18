'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('treasury', {
      url: '/treasury',
      template: '<treasury></treasury>'
    });
}
