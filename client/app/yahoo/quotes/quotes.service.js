'use strict';
const angular = require('angular');

/*@ngInject*/
export function quotesService($http, $sce, $q) {
	// AngularJS will instantiate a singleton by calling "new" on this function

	return {
		getQuote: getQuote
	};

	function getQuote (symbol) {

		var YAHOO = window.YAHOO = {Finance: {SymbolSuggest: {}}};
	      YAHOO.Finance.SymbolSuggest.ssCallback = function (data) 
	      {

	      	var result = data.query.results.quote;

	          result.LastTradePriceOnly = parseFloat(result.LastTradePriceOnly);
	          var lastTradeDate = result.LastTradeDate.split('/');
	          var lastTradeTime = result.LastTradeTime.split(':');
	          lastTradeTime[2] = lastTradeTime[1].substr(lastTradeTime[1].length - 2);
	          lastTradeTime[1] = lastTradeTime[1].slice(0, -2);
	          if(lastTradeTime[2] == 'pm') lastTradeTime[0] = parseInt(lastTradeTime[0])+12;
	          result.LastTradeDate = new Date(parseInt(lastTradeDate[2]), parseInt(lastTradeDate[0])-1, parseInt(lastTradeDate[1]), lastTradeTime[0], lastTradeTime[1]);
	                          
	          dfd.resolve(result);
	          
	      }; // YAHOO.Finance success

	      var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%3D%22'+encodeURI(symbol)+'%22&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json';
	      
	      var dfd = $q.defer();
	      $http.jsonp($sce.trustAsResourceUrl(url), { jsonpCallbackParam: 'callback=YAHOO.Finance.SymbolSuggest.ssCallback&test=' })
	      .then(YAHOO.Finance.SymbolSuggest.ssCallback, function(data) {
	          dfd.reject(data);
	      }).catch(err => {

	        console.log(err);
	          dfd.reject(err);
	      });
	      return dfd.promise;

	}
}

quotesService.$inject = ["$http", "$sce", "$q"];

export default angular.module('curvesInvestingApp.quotes', [])
  .service('quotes', quotesService)
  .name;
