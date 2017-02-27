'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './graphProgress.routes';

export class GraphProgressComponent {
  /*@ngInject*/
  constructor($scope, $http, historicalQuotes) {



    $scope.showTable = true;



    $scope.firstFound = 0;
    
    $http.get('/api/trades/weekProgress')
      .then(result => {
        $scope.weeks = result.data;
        var saveWeeks = $scope.weeks;

        var params = {
          startDate: new Date($scope.weeks[0].date),
          endDate: new Date($scope.weeks[$scope.weeks.length-1].date)
        };

        $http.post('/api/graphProgress/getCache', params)
          .then(resCache => {

            if(resCache.data.length == 0) getWalletValue();
            else {
              $scope.weeks = resCache.data[0].weeks;
              $scope.weeks.pop();
              
              for(var i=0; i<saveWeeks.length; i++) {
                if(!$scope.weeks[i]) {
                  if(!$scope.firstFound) $scope.firstFound = i;
                  $scope.weeks[i] = saveWeeks[i];
                }
              }

              $scope.next = $scope.firstFound;
              $scope.nextCAC = $scope.firstFound;
              if($scope.firstFound) getWalletValue();
              else generateChart();
            }

          })
          .catch(err => {
            console.log(err);
            throw err;
          });
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
        
        for(var weekNo = $scope.firstFound; weekNo < $scope.weeks.length; weekNo++) {
          
          $scope.weeks[weekNo].totalValue = $scope.weeks[weekNo].cashBalance + $scope.walletValue[weekNo];
          $scope.weeks[weekNo].win = $scope.weeks[weekNo].totalValue - $scope.weeks[weekNo].cashGiven;

          $scope.weeks[weekNo].p = [];
          $scope.weeks[weekNo].pwin = [];

          for(var i=1; i<=10; i++) {
            if(weekNo == 0) $scope.weeks[weekNo].p[i] = $scope.weeks[weekNo].cashGiven;
            else {
              $scope.weeks[weekNo].p[i] = $scope.weeks[weekNo-1].p[i] * Math.pow(1+i/100, 1/52) + $scope.weeks[weekNo].cashGiven - $scope.weeks[weekNo-1].cashGiven;
            }

            $scope.weeks[weekNo].pwin[i] = $scope.weeks[weekNo].p[i] - $scope.weeks[weekNo].cashGiven;
          }

          if(weekNo == 0) {
            $scope.weeks[weekNo].pCAC = $scope.weeks[weekNo].cashGiven;
            $scope.weeks[weekNo].pETFWD = $scope.weeks[weekNo].cashGiven;
            $scope.weeks[weekNo].pwinCAC = 0;
            $scope.weeks[weekNo].pwinETFWD = 0;
          }

        }

        getCACETFvalue();

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


            $scope.nextCAC++;

            if($scope.nextCAC < $scope.weeks.length) getCACETFvalue();
            else {

              generateChart();

              var params = {
                startDate: $scope.weeks[0].date,
                endDate: $scope.weeks[$scope.weeks.length-1].date,
                weeks: $scope.weeks
              };
              $http.post('/api/graphProgress', params)
              .catch(err => {
                console.log(err);
                throw err;
              });
            }
          })
          .catch(err => {
            console.log(err);
          });

      }




      function generateChart() {

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

          var date = new Date(week.date);
            
          var formatDate = date.getDate() <10 ? '0'+date.getDate() : date.getDate();
          formatDate += '/';
          formatDate += (date.getMonth()+1) < 10 ? '0'+(date.getMonth()+1) : (date.getMonth()+1);
          formatDate += '/';
          formatDate += date.getFullYear();

          $scope.myChartObject.data.rows.push({c: [
              {v: formatDate},
              {v: week.win},
              {v: week.pwin[2]},
              {v: week.pwin[4]},
              {v: week.pwin[6]},
              {v: week.pwin[8]},
              {v: week.pwin[10]},
              {v: week.pwinCAC},
              {v: week.pwinETFWD},
          ]});

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
