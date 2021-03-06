'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './buysell.routes';

export class BuysellComponent {
  /*@ngInject*/
  constructor($scope, $http, userSelection, $sce, $q, $log, quotesName, quotes) {
    
    $scope.result = [];

    $scope.getValues = function() {
      quotesName.getName($scope.valueName)
        .then(result => {
          $scope.result = result;
        });        
    };


    $scope.selectValue = function(index) {

      $scope.selectedValue = {
        name : $scope.result[index].name,
        symbol : $scope.result[index].value.symbol
      }

      $scope.valueName = $scope.result[index].name;

      getValueDetails($scope.selectedValue.symbol);

      $scope.result = [];

    }

    function getValueDetails(symbol) {

      quotes.getQuote(symbol)
        .then(result => {
          $scope.price = result.LastTradePriceOnly;
          $scope.lastTradeValue = result.LastTradePriceOnly;
          $scope.lastTradeDate = result.LastTradeDate;
        })
        .catch(err => {
          console.log(err);
        });

    }









    $scope.orderDate = new Date();
    $scope.orderType = "ACL";


    $scope.formValidation = function () {

      var club = userSelection.get('accountSelected');

      var data = {
        clubCode: club.clubCode != '' ? club.clubCode : undefined,
        date: $scope.orderDate,
        symbol: $scope.selectedValue.symbol,
        name: $scope.selectedValue.name,
        buyOrSell: $scope.buyOrSell,
        orderDone: $scope.orderDone,
        orderType: ($scope.orderDone == 'false' ? $scope.orderType : undefined),
        quantity: ($scope.buyOrSell == 'sell' ? -$scope.quantity : $scope.quantity),
        price: ($scope.orderType == 'ACL' ? $scope.price : $scope.orderType == 'OAM' || $scope.orderType == 'APM' ? $scope.actualPrice : undefined),
        limit1: ($scope.orderType == 'ASD' || $scope.orderType == 'APD' ? $scope.limit1 : undefined),
        limit2: ($scope.orderType == 'APD' ? $scope.limit2 : undefined),
        fees: $scope.fees,
        total: Math.round(100*(($scope.buyOrSell == 'buy' ? 1 : -1) * $scope.quantity * ($scope.orderType == 'ACL' ? $scope.price : $scope.orderType == 'OAM' || $scope.orderType == 'APM' ? $scope.actualPrice : $scope.limit1) + ($scope.buyOrSell == 'buy' ? -1 : 1)*$scope.fees))/100
      };

      console.log(data);


      $http.post('/api/trades', data);


      $scope.orderValidated = true;

      $scope.orderText = $scope.orderDone ? $scope.buyOrSell == 'buy' ? "Achat " : "Vente " : $scope.buyOrSell == 'sell' ? "Ordre d'achat " : "Ordre de vente ";
      $scope.orderText += "de "+$scope.quantity+" action"+ ($scope.quantity>1 ? "s " : " ") +$scope.selectedValue.name;

      if($scope.orderDone == 'false') {
        switch($scope.orderType) {
          case 'ACL' : 
            $scope.orderText += " à cours limité de "+$scope.price+" €";
            break;
          case 'OAM' :
            $scope.orderText += " au marché";
            break;
          case 'APM' : 
            $scope.orderText += " à la meilleure limite";
            break;
          case 'ASD' : 
            $scope.orderText += " à seuil de déclenchement de "+$scope.limit1+" €";
            break;
          case 'APD' : 
            $scope.orderText += " à plage de déclenchement, entre "+$scope.limit1+" et "+$scope.limit2+" €";
            break;
        }
      } else {
        $scope.orderText += " à "+$scope.price+" €";
      }
      if($scope.fees) $scope.orderText += ", avec "+$scope.fees+" € de frais";
      else $scope.orderText += ", sans frais";

      $scope.orderText += ", en date du ";

      $scope.orderTextDate = $scope.orderDate;


      $scope.buyOrSell = undefined;
      $scope.orderDone = undefined;
      $scope.orderType = 'ACL';
      $scope.quantity = undefined;
      $scope.price = undefined;
      $scope.limit1 = undefined;
      $scope.limit2 = undefined;
      $scope.fees = undefined;
      $scope.total = undefined;
      $scope.valueName = undefined;
      $scope.selectedValue = undefined;


    }

    

  }


  
}



BuysellComponent.$inject = ["$scope", "$http", "userSelection", "$sce", "$q", "$log", "quotesName", "quotes"];

export default angular.module('curvesInvestingApp.buysell', [uiRouter])
  .config(routes)
  .component('buysell', {
    template: require('./buysell.html'),
    controller: BuysellComponent,
    controllerAs: 'buysellCtrl'
  })
  .name;
