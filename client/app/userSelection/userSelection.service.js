'use strict';
const angular = require('angular');

/*@ngInject*/
export function userSelectionService() {
	// AngularJS will instantiate a singleton by calling "new" on this function

	var info = [];

	return {
		get: get,
		set: set
	};

	function get(key) {
		return info[key];
	}

	function set(key, value) {
		info[key] = value;
	}
}

export default angular.module('curvesInvestingApp.userSelection', [])
  .service('userSelection', userSelectionService)
  .name;
