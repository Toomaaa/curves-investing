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

	          // equity.actualPrice = data.query.results.quote.LastTradePriceOnly;

	          // equity.plusmoins = (equity.quantity*equity.actualPrice) - equity.totalPrice;
	          // equity.performance = (equity.plusmoins / equity.totalPrice)*100;

	          // $scope.wallet.total.bought += equity.totalPrice;
	          // $scope.wallet.total.actual += equity.quantity*equity.actualPrice;

	          // $scope.wallet.total.plusmoins = $scope.wallet.total.actual - $scope.wallet.total.bought;
	          // $scope.wallet.total.performance = ($scope.wallet.total.plusmoins / $scope.wallet.total.bought)*100;
	                          
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
