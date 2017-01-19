'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './treasury.routes';

export class TreasuryComponent {
  /*@ngInject*/
  constructor($scope, $http, userSelection) {
    
    $http.get('/api/trades/treasury')
      .then(result => {
        console.log(result);
        $scope.treasury_moves = result.data[0].treasury_moves;
      })
      .catch(err => {
        console.log(err);
      });


    $scope.getSum = function (index) {
      var sum=0;

      for(var i=0; i<=index; i++) {  
        sum += $scope.treasury_moves[i].amount;
      }

      return sum;
    }


    $scope.toggleSubscriptionsView = function() {

      var periodsFound = [];
      var periodsIndex = [];

      if($scope.toggleSubscriptions) {
        $scope.saved_treasury_moves = angular.copy($scope.treasury_moves);

        for(var i=0; i<$scope.treasury_moves.length; i++) {

          if($scope.treasury_moves[i].period && $scope.treasury_moves[i].amount!=0) {

            var period = new Date($scope.treasury_moves[i].period);
            var periodEnd = new Date($scope.treasury_moves[i].periodEnd);

            if(periodsFound.indexOf(period.getTime()) == -1) {
              periodsFound.push(period.getTime());
              periodsIndex.push(i);
              $scope.treasury_moves[i].wording = "Versement membres"; // période du "+period.getDate()+"/"+(period.getMonth()+1)+" au "+periodEnd.getDate()+"/"+(periodEnd.getMonth()+1)+"/"+periodEnd.getFullYear();
              $scope.treasury_moves[i].date = new Date(period);
            }
            else {
              var index = periodsFound.indexOf(period.getTime());
              index = periodsIndex[index];

              $scope.treasury_moves[index].amount += $scope.treasury_moves[i].amount;

              $scope.treasury_moves.splice(i, 1);
              i--;
            }

          }
        }

      }
      else {
        $scope.treasury_moves = angular.copy($scope.saved_treasury_moves);
      }

    }


  }
}

TreasuryComponent.$inject = ["$scope", "$http", "userSelection"];

export default angular.module('curvesInvestingApp.treasury', [uiRouter])
  .config(routes)
  .component('treasury', {
    template: require('./treasury.html'),
    controller: TreasuryComponent,
    controllerAs: 'treasuryCtrl'
  })
  .name;
