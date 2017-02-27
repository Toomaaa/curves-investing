'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  menu = [
  // {
  //   title: 'Accueil',
  //   state: 'main'
  // }
  ];

  isCollapsed = true;

  constructor(Auth, $scope, $state, $http, userSelection, $window) {
    'ngInject';

    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    $scope.accountSelected = {
      type: '',
      clubCode: '',
      clubName: '',
      function: ''
    };

    $scope.$watch(this.isLoggedIn, function() {

      Auth.getCurrentUser(currentUser => {

        if(currentUser._id && currentUser._id != '') {

          $http.get('/api/users/accountSelected')
            .then(response => {

              if(response.data.accountSelected) {
                userSelection.set('accountSelected', response.data.accountSelected);
                $scope.accountSelected = response.data.accountSelected;
              }
              else if(currentUser.isPartOfClub) {
                $scope.accountSelected = {
                  type: 'club',
                  clubCode: currentUser.club[0].clubCode,
                  clubName: currentUser.club[0].clubName,
                  function: currentUser.club[0].function
                };
                userSelection.set('accountSelected', $scope.accountSelected);
              }
              else {
                $scope.accountSelected = {
                  type: 'individual',
                  clubCode: '',
                  clubName: '',
                  function: ''
                };
              }
              setAccountSelectedInBdd($scope.accountSelected);
            })
            .catch(err => {
              console.log(err);

              $scope.accountSelected.type = 'club';
              $scope.accountSelected.clubCode = currentUser.club[0].clubCode;
              $scope.accountSelected.clubName = currentUser.club[0].clubName;
              $scope.accountSelected.function = currentUser.club[0].function;

              userSelection.set('accountSelected', $scope.accountSelected);
            });

          $scope.accountChoices = [];
          if(currentUser.individualAccount) $scope.accountChoices.push({type: 'individual'});
          if(currentUser.isPartOfClub) {
            currentUser.club.forEach(club => {
              $scope.accountChoices.push({type: 'club', clubCode: club.clubCode, clubName: club.clubName, function: club.function});
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
    });

    this.setAccount = function(type, clubCode) {
      var accountSelected =  {};

      if(type == 'individual') {
        accountSelected = {
          type: 'individual',
          clubCode: '',
          clubName: '',
          function: ''
        };
      }
      else if(type == 'club') {
        $scope.accountChoices.forEach(accountChoice => {
          if(accountChoice.clubCode == clubCode) {
            accountSelected.type = 'club';
            accountSelected.clubCode = clubCode;
            accountSelected.clubName = accountChoice.clubName;
            accountSelected.function = accountChoice.function;
          }
        });
      }
      userSelection.set('accountSelected', accountSelected);
      setAccountSelectedInBdd(accountSelected);
      $window.location.reload();
    }

    function setAccountSelectedInBdd(accountSelected) {
      $http.post('/api/users/accountSelected', { accountSelected: accountSelected });
    }
  }

}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
