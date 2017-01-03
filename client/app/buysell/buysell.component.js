'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './buysell.routes';

export class BuysellComponent {
  /*@ngInject*/
  constructor($scope, $http, userSelection, $sce, $q, $log) {
    
    $scope.result = [];

    $scope.getValues = function() {

      var YAHOO = window.YAHOO = {Finance: {SymbolSuggest: {}}};
      YAHOO.Finance.SymbolSuggest.ssCallback = function (data) 
      {
          $scope.result = [];
          
          angular.forEach(data.ResultSet.Result, function(stock)
          {
              $scope.result.push({
                  name : stock.name,
                  tooltip : stock.name + ' (' + stock.symbol + ', ' + stock.exchDisp + ')',
                  value : stock
              });
          });

          console.log($scope.result);
                          
          dfd.resolve($scope.result);
      }; // YAHOO.Finance success

      var url = 'http://autoc.finance.yahoo.com/autoc?query='+$scope.valueName+'&region=FR&lang=fr';
      var dfd = $q.defer();
      $http.jsonp($sce.trustAsResourceUrl(url), { jsonpCallbackParam: 'callback=YAHOO.Finance.SymbolSuggest.ssCallback&test=' })
      .then(YAHOO.Finance.SymbolSuggest.ssCallback, function(data) {
          dfd.reject(data);
      }).catch(err => {

        console.log(err);
          dfd.reject(err);
      });
      return dfd.promise;
    
    };


    $scope.selectValue = function(index) {

      $scope.selectedValue = {
        name : $scope.result[index].name,
        symbol : $scope.result[index].value.symbol
      }

      $scope.result = [];

    }


    

  }


  
}



BuysellComponent.$inject = ["$scope", "$http", "userSelection", "$sce", "$q", "$log"];

export default angular.module('curvesInvestingApp.buysell', [uiRouter])
  .config(routes)
  .component('buysell', {
    template: require('./buysell.html'),
    controller: BuysellComponent,
    controllerAs: 'buysellCtrl'
  })
  .name;
