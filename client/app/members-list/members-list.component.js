'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './members-list.routes';

export class MembersListComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('curvesInvestingApp.members-list', [uiRouter])
  .config(routes)
  .component('membersList', {
    template: require('./members-list.html'),
    controller: MembersListComponent,
    controllerAs: 'membersListCtrl'
  })
  .name;
