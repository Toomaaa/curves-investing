'use strict';
const angular = require('angular');

/*@ngInject*/
export function historicalQuotesService($http, $sce, $q) {
	// AngularJS will instantiate a singleton by calling "new" on this function

	return {
		getQuote: getQuote,
		getWallet: getWallet,
		getCACETFvalue: getCACETFvalue
	};

	function getQuote (symbol, date) {

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

	      date = new Date(date);
	      date = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
	      var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%3D%22'+encodeURI(symbol)+'%22%20and%20startDate%3D%22'+date+'%22%20and%20endDate%3D%22'+date+'%22&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json';
	      
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



	function getWallet (wallet, date) {

		var YAHOO = window.YAHOO = {Finance: {SymbolSuggest: {}}};
	      YAHOO.Finance.SymbolSuggest.ssCallback = function (data) 
	      {

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
	          
	      }; // YAHOO.Finance success

	      date = new Date(date);
	      var formatDate = date.getFullYear()+'-';
	      formatDate += (date.getMonth()+1) < 10 ? '0'+(date.getMonth()+1) : (date.getMonth()+1);
	      formatDate += '-';
	      formatDate += date.getDate() <10 ? '0'+date.getDate() : date.getDate();

	      var symbol_query = '';
	      wallet.forEach(equity => {
	      	symbol_query += '%22'+encodeURI(equity.symbol)+'%22,';
	      });
	      symbol_query = symbol_query.substring(0, symbol_query.length-1);

	      // 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20(symbol%20%3D%20%22ENGI.PA%22%20or%20symbol%20%3D%20%22PRIO.PA%22%20or%20symbol%20%3D%20%22ALVIV.PA%22)%20and%20startDate%20%3D%20%222017-01-13%22%20and%20endDate%20%3D%20%222017-01-13%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='

	      if(date.getFullYear() === new Date().getFullYear() && date.getMonth() === new Date().getMonth() && date.getDate() === new Date().getDate())
	      	var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20('+symbol_query+')&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json';
	      else
	      	var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20('+symbol_query+')%20and%20startDate%3D%22'+formatDate+'%22%20and%20endDate%3D%22'+formatDate+'%22&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json';
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





	function getCACETFvalue (date) {

		var symbol_query = '%22^FCHI%22,%22EWLD.PA%22';

		var YAHOO = window.YAHOO = {Finance: {SymbolSuggest: {}}};
	      YAHOO.Finance.SymbolSuggest.ssCallback = function (data) 
	      {

	      	var results = [];
		    var walletValue = {};

		    if(data.query.count > 0) {
		    	
		    	if(data.query.count == 1) results[0] = data.query.results.quote;
		      	else results = data.query.results.quote;

	      		results.forEach(result => {

	      			console.log(result);

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
	          
	      }; // YAHOO.Finance success

	      date = new Date(date);
	      var formatDate = date.getFullYear()+'-';
	      formatDate += (date.getMonth()+1) < 10 ? '0'+(date.getMonth()+1) : (date.getMonth()+1);
	      formatDate += '-';
	      formatDate += date.getDate() <10 ? '0'+date.getDate() : date.getDate();

	      if(date.getFullYear() === new Date().getFullYear() && date.getMonth() === new Date().getMonth() && date.getDate() === new Date().getDate())
	      	var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20('+symbol_query+')&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json';
	      else
	      	var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20('+symbol_query+')%20and%20startDate%3D%22'+formatDate+'%22%20and%20endDate%3D%22'+formatDate+'%22&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json';
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

historicalQuotesService.$inject = ["$http", "$sce", "$q"];

export default angular.module('curvesInvestingApp.historicalQuotes', [])
  .service('historicalQuotes', historicalQuotesService)
  .name;
