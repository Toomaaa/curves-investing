'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('graphProgress', {
      url: '/graphProgress',
      template: '<graph-progress></graph-progress>'
    });
}
