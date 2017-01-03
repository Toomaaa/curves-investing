'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './members-list.routes';

export class MembersListComponent {
  /*@ngInject*/
  constructor($scope, $http, userSelection) {

    $scope.$watch(function() { return userSelection.get('accountSelected'); }, function() {
      $http.get('/api/users/accountSelected')
        .then(response => {
          $scope.accountSelected = response.data.accountSelected;

          $http.get('/api/clubs/clubCode/'+$scope.accountSelected.clubCode)
            .then(response => {
              $scope.club = response.data;
            })
            .catch(err => {
              console.log(err);
            });

          $http.get('/api/subscriptions/clubCode/'+$scope.accountSelected.clubCode)
            .then(response => {
              $scope.subscriptions = response.data;
              // $scope.subscriptions = [{
              //   email: 'guillaume.bruno@gmail.com',
              //   clubCode: '43W0K',
              //   period: new Date(),
              //   amount: 100,
              //   type: 'initial'
              // }];
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    }, true);
    
    
    function getAccountSelected() {
      $http.get('/api/users/accountSelected')
        .then(response => {
          return response.data.accountSelected;
        })
        .catch(err => {
          console.log(err);
          throw err;
        })
    }


    $scope.isSubscriptionOk = function(email, type, amount, period) {
      
      if($scope.subscriptions) {
        return $scope.subscriptions.find(filterInResults);

        function filterInResults(element) {
          return element.email == email && element.type == type && element.amount >= amount;
        }
      }

    }
    

  }
}
MembersListComponent.$inject = ["$scope", "$http", "userSelection"];

export default angular.module('curvesInvestingApp.members-list', [uiRouter])
  .config(routes)
  .component('membersList', {
    template: require('./members-list.html'),
    controller: MembersListComponent,
    controllerAs: 'membersListCtrl'
  })
  .name;
