'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './graphProgress.routes';

export class GraphProgressComponent {
  /*@ngInject*/
  constructor($scope, $http, historicalQuotes) {
    
    $http.get('/api/clubs/weekProgress')
      .then(result => {
        console.log(result);
        $scope.weeks = result.data;

        getWalletValue();
      })
      .catch(err => {
        console.log(err);
      });


      $scope.walletValue = [];
      $scope.next = 0;

      function getWalletValue() {

        var week = $scope.weeks[$scope.next];

        if(week.wallet.length > 0) {
          historicalQuotes.getWallet(week.wallet, week.date)
            .then(walletValue => {
              $scope.walletValue[$scope.next] = walletValue;
              $scope.next++;           
              if($scope.next < $scope.weeks.length) getWalletValue();
              else finishCalculation();
            })
            .catch (err => {
              console.log(err);
            });
        }
        else {
          $scope.walletValue[$scope.next] = 0;
          $scope.next++;           
          if($scope.next < $scope.weeks.length) getWalletValue();
          else finishCalculation();
        }

      }



      function finishCalculation() {

        var countWeek = 0;

        getCACETFvalue();

        $scope.weeks.forEach(week => {
          week.totalValue = week.cashBalance + $scope.walletValue[countWeek];
          week.win = week.totalValue - week.cashGiven;

          week.p = [];
          week.pwin = [];

          for(var i=1; i<=10; i++) {
            if(countWeek == 0) week.p[i] = week.cashGiven;
            else week.p[i] = $scope.weeks[countWeek-1].p[i] * Math.pow(1+i/100, 1/52) + week.cashGiven - $scope.weeks[countWeek-1].cashGiven;

            week.pwin[i] = week.p[i] - week.cashGiven;
          }

          if(countWeek == 0) {
            week.pCAC = week.cashGiven;
            week.pETFWD = week.cashGiven;
          }

          countWeek++;
        });

      }


      $scope.nextCAC = 0;

      function getCACETFvalue() {

        historicalQuotes.getCACETFvalue($scope.weeks[$scope.nextCAC].date)
          .then(result => {

            console.log(result);

            $scope.weeks[$scope.nextCAC].CACvalue = result.CACvalue;
            $scope.weeks[$scope.nextCAC].ETFWDvalue = result.ETFWDvalue;

            if($scope.nextCAC > 0) {
              $scope.weeks[$scope.nextCAC].pCAC = $scope.weeks[$scope.nextCAC-1].pCAC * ($scope.weeks[$scope.nextCAC].CACvalue / $scope.weeks[$scope.nextCAC-1].CACvalue) + ($scope.weeks[$scope.nextCAC].cashGiven - $scope.weeks[$scope.nextCAC-1].cashGiven)*0.998;
              $scope.weeks[$scope.nextCAC].pETFWD = $scope.weeks[$scope.nextCAC-1].pETFWD * ($scope.weeks[$scope.nextCAC].ETFWDvalue / $scope.weeks[$scope.nextCAC-1].ETFWDvalue) + ($scope.weeks[$scope.nextCAC].cashGiven - $scope.weeks[$scope.nextCAC-1].cashGiven)*0.998;

              $scope.weeks[$scope.nextCAC].pwinCAC = $scope.weeks[$scope.nextCAC].pCAC - $scope.weeks[$scope.nextCAC].cashGiven;
              $scope.weeks[$scope.nextCAC].pwinETFWD = $scope.weeks[$scope.nextCAC].pETFWD - $scope.weeks[$scope.nextCAC].cashGiven;
            }

            $scope.nextCAC++;
            if($scope.nextCAC < $scope.weeks.length) getCACETFvalue();
          })
          .catch(err => {
            console.log(err);
          });

      }


  }
}


GraphProgressComponent.$inject = ["$scope", "$http", "historicalQuotes"];

export default angular.module('curvesInvestingApp.graphProgress', [uiRouter])
  .config(routes)
  .component('graphProgress', {
    template: require('./graphProgress.html'),
    controller: GraphProgressComponent,
    controllerAs: 'graphProgressCtrl'
  })
  .name;
