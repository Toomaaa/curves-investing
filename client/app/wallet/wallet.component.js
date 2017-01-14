'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './wallet.routes';

export class WalletComponent {
  /*@ngInject*/
  constructor($scope, $http, $sce, $q, quotes) {

    $scope.wallet = { 
      total : {
          bought: 0,
          actual: 0
      } 
    };
    $scope.orderValidation = [];
    $scope.edit = {
      price : [],
      newPrice : [],
      date : [],
      quantity : [],
      fees : [],
      orderType : [],
      limit1: [],
      limit2: []
    };

    getEquities();
    getOrders();


    $scope.next=0;
    $scope.valueDetailsDone = false;

    function getValueDetails() {
      
      var equity = $scope.wallet.equities[$scope.next];

      quotes.getQuote(equity._id)
        .then(result => {
          equity.actualPrice = result.LastTradePriceOnly;
          equity.lastTradeDate = result.LastTradeDate;

          equity.plusmoins = (equity.quantity*equity.actualPrice) - equity.totalPrice;
          equity.performance = (equity.plusmoins / equity.totalPrice)*100;

          $scope.wallet.total.bought += equity.totalPrice;
          $scope.wallet.total.actual += equity.quantity*equity.actualPrice;

          $scope.wallet.total.plusmoins = $scope.wallet.total.actual - $scope.wallet.total.bought;
          $scope.wallet.total.performance = ($scope.wallet.total.plusmoins / $scope.wallet.total.bought)*100;

          $scope.next++;
          if($scope.next < $scope.wallet.equities.length) getValueDetails();
          else { 
            $scope.next=0;
            $scope.valueDetailsDone = true;
            console.log("details Done");
            return true;
          }
        })
        .catch(err => {
          console.log(err);
        });
    }

    function getEquities() {
    
      $http.get('/api/trades/wallet')
        .then(response => {

          $scope.wallet.equities = response.data;
            
          getValueDetails();

        })
        .catch(err => {
          console.log(err);
        });

    }



    function getOrders() {
      $http.get('/api/trades/orders')
        .then(response => {
          $scope.orders = response.data;
          getOrdersDetails();
        })
        .catch(err => {
          console.log(err);
        });
    }


    $scope.nextOrder=0;

    function getOrdersDetails() {

      console.log($scope.valueDetailsDone);
      if(!$scope.valueDetailsDone) {
        setTimeout(getOrdersDetails, 500);
        return false;
      }

      var order = $scope.orders[$scope.nextOrder];

      quotes.getQuote(order.symbol)
        .then(result => {
          order.actualPrice = result.LastTradePriceOnly;
          order.lastTradeDate = result.LastTradeDate;

          $scope.nextOrder++;
          if($scope.nextOrder < $scope.orders.length) getOrdersDetails();
          else { 
            $scope.nextOrder=0;
            return true;
          }
        })
        .catch(err => {
          console.log(err);
        });
    }


    $scope.validateOrder = function(index, verifPrice) {
      
      if(!verifPrice) {
        $scope.orderValidation[index] = "validate";
        $scope.edit.newPrice[index] = $scope.orders[index].price || $scope.orders[index].limit1 || 999.99; // remplacer 999.99 par le cours actuel en cas de vente au marché
        $scope.edit.fees[index] = $scope.orders[index].fees;
        $scope.edit.date[index] = new Date();
        $scope.edit.quantity[index] = $scope.orders[index].quantity;
      }
      else {
        var orderId = $scope.orders[index]._id;
        var order = $scope.orders[index];
        order.date = $scope.edit.date[index];
        order.orderDone = true;
        order.orderType = undefined;
        order.price = $scope.edit.newPrice[index];
        order.limit1 = undefined;
        order.limit2 = undefined;
        order.fees = $scope.edit.fees[index];
        order.quantity = $scope.edit.quantity[index];

        $http.put('/api/trades/'+orderId, order)
          .then(response => {

            getEquities();
            getOrders();

            $scope.orderValidation.splice(index, 1);

          })
          .catch(err => {
            console.log(err);
          });

      }
    }



    $scope.editOrder = function(index, validation) {
      
      if(!validation) {
        $scope.orderValidation[index] = "edit";
        $scope.edit.price[index] = $scope.orders[index].price || $scope.orders[index].limit1 || 999.99; // remplacer 999.99 par le cours actuel en cas de vente au marché
        $scope.edit.fees[index] = $scope.orders[index].fees;
        $scope.edit.date[index] = new Date($scope.orders[index].date);
        $scope.edit.quantity[index] = $scope.orders[index].quantity;
        $scope.edit.orderType[index] = $scope.orders[index].orderType;
      }
      else {
        var orderId = $scope.orders[index]._id;
        var order = $scope.orders[index];
        order.date = $scope.edit.date[index];
        order.orderType = $scope.edit.orderType[index];
        order.price = (order.orderType == 'ACL' ? $scope.edit.price[index] : null);
        order.limit1 = (order.orderType == 'ASD' || order.orderType == 'APD' ? $scope.edit.limit1[index] : null);
        order.limit2 = (order.orderType == 'APD' ? $scope.edit.limit2[index] : null);
        order.fees = $scope.edit.fees[index];
        order.quantity = $scope.edit.quantity[index];

        $http.put('/api/trades/'+orderId, order)
          .then(response => {

            getOrders();

            $scope.orderValidation[index] = undefined;

          })
          .catch(err => {
            console.log(err);
          });
      }
    }


    $scope.deleteOrder = function(index, validation) {

      if(!validation) {
        $scope.orderValidation[index] = "delete";
      }
      else {
        var orderId = $scope.orders[index]._id;

        $http.delete('/api/trades/'+orderId)
          .then(response => {

            getOrders();
            $scope.orderValidation.splice(index, 1);

          });
      }

    }


    $scope.resetValidation = function(index) {

      $scope.orderValidation[index] = undefined;

    }

  }
}

WalletComponent.$inject = ["$scope", "$http", "$sce", "$q", "quotes"];

export default angular.module('curvesInvestingApp.wallet', [uiRouter])
  .config(routes)
  .component('wallet', {
    template: require('./wallet.html'),
    controller: WalletComponent,
    controllerAs: 'walletCtrl'
  })
  .name;
