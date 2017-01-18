'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './accountHistory.routes';

export class AccountHistoryComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('curvesInvestingApp.accountHistory', [uiRouter])
  .config(routes)
  .component('accountHistory', {
    template: require('./accountHistory.html'),
    controller: AccountHistoryComponent,
    controllerAs: 'accountHistoryCtrl'
  })
  .name;
