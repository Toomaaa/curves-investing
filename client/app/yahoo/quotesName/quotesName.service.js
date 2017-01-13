'use strict';
const angular = require('angular');

/*@ngInject*/
export function quotesNameService($http, $sce, $q) {
	// AngularJS will instantiate a singleton by calling "new" on this function

	return {
		getName: getName
	};

	function getName (entry) {

		var YAHOO = window.YAHOO = {Finance: {SymbolSuggest: {}}};

		YAHOO.Finance.SymbolSuggest.ssCallback = function (data) 
		{
		  var result = [];
		  
		  angular.forEach(data.ResultSet.Result, function(stock)
		  {
		      result.push({
		          name : stock.name,
		          tooltip : stock.name + ' (' + stock.symbol + ', ' + stock.exchDisp + ')',
		          value : stock
		      });
		  });
		                  
		  dfd.resolve(result);
		}; // YAHOO.Finance success


		var url = 'http://autoc.finance.yahoo.com/autoc?query='+encodeURI(entry)+'&region=FR&lang=fr';
		console.log(url);

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

quotesNameService.$inject = ["$http", "$sce", "$q"];

export default angular.module('curvesInvestingApp.quotesName', [])
  .service('quotesName', quotesNameService)
  .name;
