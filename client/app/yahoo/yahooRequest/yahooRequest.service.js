'use strict';
const angular = require('angular');

/*@ngInject*/
export function yahooRequestService($http, $sce, $q) {
	// AngularJS will instantiate a singleton by calling "new" on this function


	return {
		doRequest: doRequest,
	};


	function doRequest (table, symbol, date) {
		// (String, String or Array, Date)

		var dfd = $q.defer();

		if(table != 'quotes') {
			$http.get('/api/yahooCaches/'+table+'/'+symbol+'/'+date)
				.then(result => {
					if(result.data.length > 0){
						dfd.resolve(result.data[0].response);	
					} 
					else coreRequest(dfd, table, symbol, date);
				})
				.catch(err => {
					dfd.reject(err);
				});	
		}
		else coreRequest(dfd, table, symbol, date);
		
		return dfd.promise;

	}


	function coreRequest(dfd, table, symbol, date) {
		var YAHOO = window.YAHOO = {Finance: {SymbolSuggest: {}}};
		YAHOO.Finance.SymbolSuggest.ssCallback = function (data) 
		{
		  $http.post('/api/yahooCaches/'+table+'/'+symbol+'/'+date, data);
		  dfd.resolve(data);
		}; // YAHOO.Finance success


		var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.'+table+'%20where%20symbol%20in%20(';

		if(Array.isArray(symbol)) {
			for(var i=0; i<symbol.length; i++) {
				url += '%22'+symbol[i]+'%22';
				if(i+1 < symbol.length) url += ',';
			}
		}
		else { url += '%22'+symbol+'%22'; }

		url += ')';

		if(date && table != 'quotes') {
			date = new Date(date);
			var formatDate = date.getFullYear()+'-';
			formatDate += (date.getMonth()+1) < 10 ? '0'+(date.getMonth()+1) : (date.getMonth()+1);
			formatDate += '-';
			formatDate += date.getDate() <10 ? '0'+date.getDate() : date.getDate();
			url += '%20and%20startDate%3D%22'+formatDate+'%22%20and%20endDate%3D%22'+formatDate+'%22';
		}	

		url += '&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json';

		$http.jsonp($sce.trustAsResourceUrl(url), { jsonpCallbackParam: 'callback=YAHOO.Finance.SymbolSuggest.ssCallback&test=' })
		.then(YAHOO.Finance.SymbolSuggest.ssCallback, function(data) {
		  dfd.reject(data);
		}).catch(err => {
		  dfd.reject(err);
		});
	}


}

yahooRequestService.$inject = ["$http", "$sce", "$q"];

export default angular.module('curvesInvestingApp.yahooRequest', [])
  .service('yahooRequest', yahooRequestService)
  .name;

