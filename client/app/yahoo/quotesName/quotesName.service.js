'use strict';
const angular = require('angular');

/*@ngInject*/
export function quotesNameService() {
	// AngularJS will instantiate a singleton by calling "new" on this function
}

export default angular.module('curvesInvestingApp.quotesName', [])
  .service('quotesName', quotesNameService)
  .name;
