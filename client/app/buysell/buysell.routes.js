'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('buysell', {
      url: '/buysell',
      template: '<buysell></buysell>'
    });
}
