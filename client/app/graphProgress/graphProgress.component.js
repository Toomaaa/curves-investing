'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './graphProgress.routes';

export class GraphProgressComponent {
  /*@ngInject*/
  constructor($scope, $http, historicalQuotes) {



    $scope.showTable = true;



    
    $http.get('/api/clubs/weekProgress')
      .then(result => {
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








                    $scope.myChartObject = {};
                
                    $scope.myChartObject.type = "ComboChart";

                    $scope.myChartObject.data = {"cols": [
                        {id: "t", label: "Date", type: "string"},
                        {id: "s", label: "Gain", type: "number"},
                        {id: "s", label: "2%", type: "number"},
                        {id: "s", label: "4%", type: "number"},
                        {id: "s", label: "6%", type: "number"},
                        {id: "s", label: "8%", type: "number"},
                        {id: "s", label: "10%", type: "number"},
                        {id: "s", label: "CAC", type: "number"},
                        {id: "s", label: "ETF WD", type: "number"},
                    ], "rows": []};


                    $scope.myChartObject.options = {
                        'title': 'Evolution de la performance',
                        seriesType: 'line',
                        curveType: 'function',
                        width: '1500',
                        hAxis : { 
                          textStyle : {
                              fontSize: 12
                          },
                          slantedText:true, 
                          slantedTextAngle:45
                        },
                        series: {
                          0: {
                            type: 'bars',
                            color: '#000000'
                          },
                          1: {
                            type: 'line',
                            color: '#37731d'
                          },
                          2: {
                            type: 'line',
                            color: '#4c8c31'
                          },
                          3: {
                            type: 'line',
                            color: '#66a64b'
                          },
                          4: {
                            type: 'line',
                            color: '#83bf69'
                          },
                          5: {
                            type: 'line',
                            color: '#a4d98d'
                          },
                          6: {
                            type: 'line',
                            color: '#6d9eeb'
                          },
                          7: {
                            type: 'line',
                            color: '#e06666'
                          }
                        }
                    };
















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
            week.pwinCAC = 0;
            week.pwinETFWD = 0;
          }

          countWeek++;

        });

      }


      $scope.nextCAC = 0;

      function getCACETFvalue() {

        historicalQuotes.getCACETFvalue($scope.weeks[$scope.nextCAC].date)
          .then(result => {

            $scope.weeks[$scope.nextCAC].CACvalue = result.CACvalue;
            $scope.weeks[$scope.nextCAC].ETFWDvalue = result.ETFWDvalue;

            if($scope.nextCAC > 0) {
              $scope.weeks[$scope.nextCAC].pCAC = $scope.weeks[$scope.nextCAC-1].pCAC * ($scope.weeks[$scope.nextCAC].CACvalue / $scope.weeks[$scope.nextCAC-1].CACvalue) + ($scope.weeks[$scope.nextCAC].cashGiven - $scope.weeks[$scope.nextCAC-1].cashGiven)*0.998;
              $scope.weeks[$scope.nextCAC].pETFWD = $scope.weeks[$scope.nextCAC-1].pETFWD * ($scope.weeks[$scope.nextCAC].ETFWDvalue / $scope.weeks[$scope.nextCAC-1].ETFWDvalue) + ($scope.weeks[$scope.nextCAC].cashGiven - $scope.weeks[$scope.nextCAC-1].cashGiven)*0.998;

              $scope.weeks[$scope.nextCAC].pwinCAC = $scope.weeks[$scope.nextCAC].pCAC - $scope.weeks[$scope.nextCAC].cashGiven;
              $scope.weeks[$scope.nextCAC].pwinETFWD = $scope.weeks[$scope.nextCAC].pETFWD - $scope.weeks[$scope.nextCAC].cashGiven;
            }

            var date = new Date($scope.weeks[$scope.nextCAC].date);
            
            var formatDate = date.getDate() <10 ? '0'+date.getDate() : date.getDate();
            formatDate += '/';
            formatDate += (date.getMonth()+1) < 10 ? '0'+(date.getMonth()+1) : (date.getMonth()+1);
            formatDate += '/';
            formatDate += date.getFullYear();

            $scope.myChartObject.data.rows.push({c: [
                {v: formatDate},
                {v: $scope.weeks[$scope.nextCAC].win},
                {v: $scope.weeks[$scope.nextCAC].pwin[2]},
                {v: $scope.weeks[$scope.nextCAC].pwin[4]},
                {v: $scope.weeks[$scope.nextCAC].pwin[6]},
                {v: $scope.weeks[$scope.nextCAC].pwin[8]},
                {v: $scope.weeks[$scope.nextCAC].pwin[10]},
                {v: $scope.weeks[$scope.nextCAC].pwinCAC},
                {v: $scope.weeks[$scope.nextCAC].pwinETFWD},
            ]});




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
