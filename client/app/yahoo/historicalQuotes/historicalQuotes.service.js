'use strict';
const angular = require('angular');

/*@ngInject*/
export function historicalQuotesService($http, $sce, $q, yahooRequest) {
	// AngularJS will instantiate a singleton by calling "new" on this function

	return {
		getQuote: getQuote,
		getWallet: getWallet,
		getCACETFvalue: getCACETFvalue
	};

	function getQuote (symbol, date) {

		date = new Date(date);
		if(date.getFullYear() === new Date().getFullYear() && date.getMonth() === new Date().getMonth() && date.getDate() === new Date().getDate())
			var table = 'quotes';
		else
			var table = 'historicaldata';


		var dfd = $q.defer();
		yahooRequest.doRequest(table, symbol, date)
		.then(data => {
			var result = data.query.results.quote;

			result.LastTradePriceOnly = parseFloat(result.LastTradePriceOnly);
			var lastTradeDate = result.LastTradeDate.split('/');
			var lastTradeTime = result.LastTradeTime.split(':');
			lastTradeTime[2] = lastTradeTime[1].substr(lastTradeTime[1].length - 2);
			lastTradeTime[1] = lastTradeTime[1].slice(0, -2);
			if(lastTradeTime[2] == 'pm') lastTradeTime[0] = parseInt(lastTradeTime[0])+12;
			result.LastTradeDate = new Date(parseInt(lastTradeDate[2]), parseInt(lastTradeDate[0])-1, parseInt(lastTradeDate[1]), lastTradeTime[0], lastTradeTime[1]);
			              
			dfd.resolve(result);
		})
		.catch(err => {
			dfd.reject(err);
		});
		return dfd.promise;

	}



	function getWallet (wallet, date) {

		var symbols = [];
		wallet.forEach(equity => {
			symbols.push(encodeURI(equity.symbol));
		})

		date = new Date(date);
		if(date.getFullYear() === new Date().getFullYear() && date.getMonth() === new Date().getMonth() && date.getDate() === new Date().getDate())
			var table = 'quotes';
		else
			var table = 'historicaldata';

		var dfd = $q.defer();
		yahooRequest.doRequest(table, symbols, date)
		.then(data => {
			var results = [];
		    var walletValue = 0;

		    if(data.query.count > 0) {
		    	
		    	if(data.query.count == 1) results[0] = data.query.results.quote;
		      	else results = data.query.results.quote;

		      	wallet.forEach(equity => {
		      		results.forEach(result => {

		      			if(equity.symbol === result.Symbol) {

				      		if(date.getFullYear() === new Date().getFullYear() && date.getMonth() === new Date().getMonth() && date.getDate() === new Date().getDate())
		      					walletValue += parseFloat(result.LastTradePriceOnly)*equity.quantity;
				      		else walletValue += parseFloat(result.Close)*equity.quantity;
						}
					});
				});
			}
	          
	                          
	        dfd.resolve(walletValue);
		})
		.catch(err => {
			dfd.reject(err);
		});
		return dfd.promise;
	}





	function getCACETFvalue (date) {

		date = new Date(date);

		if(date.getFullYear() === new Date().getFullYear() && date.getMonth() === new Date().getMonth() && date.getDate() === new Date().getDate())
			var table = 'quotes';
		else
			var table = 'historicaldata'


		var dfd = $q.defer();
		yahooRequest.doRequest(table, ['^FCHI', 'EWLD.PA'], date)
			.then(data => {
				var results = [];
				var walletValue = {};

				if(data.query.count > 0) {
					
					if(data.query.count == 1) results[0] = data.query.results.quote;
				  	else results = data.query.results.quote;

						results.forEach(result => {

							if(result.Symbol === '^FCHI' || result.Symbol === '%5eFCHI') {
				      		if(date.getFullYear() === new Date().getFullYear() && date.getMonth() === new Date().getMonth() && date.getDate() === new Date().getDate())
									walletValue.CACvalue = parseFloat(result.LastTradePriceOnly);
				      		else walletValue.CACvalue = parseFloat(result.Close);
						}
						else if(result.Symbol === 'EWLD.PA') {
							if(date.getFullYear() === new Date().getFullYear() && date.getMonth() === new Date().getMonth() && date.getDate() === new Date().getDate())
									walletValue.ETFWDvalue = parseFloat(result.LastTradePriceOnly);
				      		else walletValue.ETFWDvalue = parseFloat(result.Close);
						}
					});
				}
				  
				                  
				dfd.resolve(walletValue);
			})
			.catch(err => {
				dfd.reject(err);
			});
		return dfd.promise;

	}


}

historicalQuotesService.$inject = ["$http", "$sce", "$q", "yahooRequest"];

export default angular.module('curvesInvestingApp.historicalQuotes', [])
  .service('historicalQuotes', historicalQuotesService)
  .name;
