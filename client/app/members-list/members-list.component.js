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

            $scope.nextSubscriptions();

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


    $scope.nextSubscriptions = function() {
      $http.get('/api/subscriptions')
        .then(response => {
          $scope.subscriptions = response.data;

          $scope.subscriptions.forEach(subscription => {
            if($scope.club.president.email === subscription.email) {
              $scope.club.president.unpaid = subscription.unpaid;
              $scope.club.president.warning = subscription.warning;
              $scope.club.president.initial = subscription.initial;
            }
            else if($scope.club.treasurer.email === subscription.email) {
              $scope.club.treasurer.unpaid = subscription.unpaid;
              $scope.club.treasurer.warning = subscription.warning;
              $scope.club.treasurer.initial = subscription.initial;
            }
            else {
              $scope.club.members.forEach(member => {
                if(member.email === subscription.email) {
                  member.unpaid = subscription.unpaid;
                  member.warning = subscription.warning;
                  member.initial = subscription.initial;
                }
              });
            }
          });

        })
        .catch(err => {
          console.log(err);
        });
    }

    $scope.validateSubscription = function(email) {

      var period, amount, type;

      if($scope.club.president.email === email) {
        period = $scope.club.president.unpaid[0].startPeriod;
        $scope.club.president.initial ? amount = amount = $scope.club.president.unpaid[0].amountDue : $scope.club.initialAmount;
        $scope.club.president.initial ? type = 'recurrent' : type = 'initial';
      }
      else if($scope.club.treasurer.email === email) {
        period = $scope.club.treasurer.unpaid[0].startPeriod;
        $scope.club.treasurer.initial ? amount = amount = $scope.club.treasurer.unpaid[0].amountDue : $scope.club.initialAmount;
        $scope.club.treasurer.initial ? type = 'recurrent' : type = 'initial';
      }
      else {
        $scope.club.members.forEach(member => {
          if(member.email === email) {
            period = member.unpaid[0].startPeriod;
            member.initial ? amount = amount = member.unpaid[0].amountDue : $scope.club.initialAmount;
            member.initial ? type = 'recurrent' : type = 'initial';
          }
        });
      }

      var data = {
        email: email,
        clubCode: $scope.accountSelected.clubCode,
        period: period,
        amount: amount,
        type: type
      };
      
      $http.post('/api/subscriptions', data)
      .then(response => {
        console.log(response);
        $scope.nextSubscriptions();
      })
      .catch(err => {
        console.log(err);
      });
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
