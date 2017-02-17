'use strict';
const angular = require('angular');

/*@ngInject*/
export function quotesService($http, $sce, $q, yahooRequest) {
	// AngularJS will instantiate a singleton by calling "new" on this function

	return {
		getQuote: getQuote
	};

	function getQuote (symbol) {

		var dfd = $q.defer();
		yahooRequest.doRequest('quotes', symbol)
			.then(data => {
				var result = data.query.results.quote;

				if(result.LastTradePriceOnly) result.LastTradePriceOnly = parseFloat(result.LastTradePriceOnly);
				if(result.LastTradeDate) {
					var lastTradeDate = result.LastTradeDate.split('/');
					var lastTradeTime = result.LastTradeTime.split(':');
					lastTradeTime[2] = lastTradeTime[1].substr(lastTradeTime[1].length - 2);
					lastTradeTime[1] = lastTradeTime[1].slice(0, -2);
					if(lastTradeTime[2] == 'pm') lastTradeTime[0] = parseInt(lastTradeTime[0])+12;
					result.LastTradeDate = new Date(parseInt(lastTradeDate[2]), parseInt(lastTradeDate[0])-1, parseInt(lastTradeDate[1]), lastTradeTime[0], lastTradeTime[1]);
				}
				              
				dfd.resolve(result);
			})
			.catch(err => {
				dfd.reject(err);
			});
		return dfd.promise;

	}
}

quotesService.$inject = ["$http", "$sce", "$q", "yahooRequest"];

export default angular.module('curvesInvestingApp.quotes', [])
  .service('quotes', quotesService)
  .name;
