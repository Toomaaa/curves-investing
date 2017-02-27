'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './accountHistory.routes';

export class AccountHistoryComponent {
  /*@ngInject*/
  constructor($scope, $http, userSelection) {
    
    $http.get('/api/trades/accountHistory')
      .then(result => {
        $scope.accountHistory_moves = result.data;
      })
      .catch(err => {
        console.log(err);
      });



    $scope.getCashBalance = function (index) {
      var cashBalance=0;

      for(var i=0; i<=index; i++) {  
        cashBalance += $scope.accountHistory_moves[i].amount;
      }

      return cashBalance;
    }


    $scope.getCashGiven = function (index) {
      var cashGiven=0;

      for(var i=0; i<=index; i++) {  
        if($scope.accountHistory_moves[i].cashGiven) cashGiven += $scope.accountHistory_moves[i].amount;
      }

      return cashGiven;
    }



    $scope.toggleSubscriptionsView = function() {

      var periodsFound = [];
      var periodsIndex = [];

      if($scope.toggleSubscriptions) {
        $scope.saved_accountHistory_moves = angular.copy($scope.accountHistory_moves);

        for(var i=0; i<$scope.accountHistory_moves.length; i++) {

          if($scope.accountHistory_moves[i].period && $scope.accountHistory_moves[i].amount!=0) {

            var period = new Date($scope.accountHistory_moves[i].period);
            var periodEnd = new Date($scope.accountHistory_moves[i].periodEnd);

            if(periodsFound.indexOf(period.getTime()) == -1) {
              periodsFound.push(period.getTime());
              periodsIndex.push(i);
              $scope.accountHistory_moves[i].wording = "Versement membres"; // période du "+period.getDate()+"/"+(period.getMonth()+1)+" au "+periodEnd.getDate()+"/"+(periodEnd.getMonth()+1)+"/"+periodEnd.getFullYear();
              $scope.accountHistory_moves[i].date = new Date(period);
            }
            else {
              var index = periodsFound.indexOf(period.getTime());
              index = periodsIndex[index];

              $scope.accountHistory_moves[index].amount += $scope.accountHistory_moves[i].amount;

              $scope.accountHistory_moves.splice(i, 1);
              i--;
            }

          }
        }

      }
      else {
        $scope.accountHistory_moves = angular.copy($scope.saved_accountHistory_moves);
      }

    }



  }
}

AccountHistoryComponent.$inject = ["$scope", "$http", "userSelection"];

export default angular.module('curvesInvestingApp.accountHistory', [uiRouter])
  .config(routes)
  .component('accountHistory', {
    template: require('./accountHistory.html'),
    controller: AccountHistoryComponent,
    controllerAs: 'accountHistoryCtrl'
  })
  .name;
