'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  menu = [{
    title: 'Accueil',
    state: 'main'
  }];

  isCollapsed = true;

  constructor(Auth, $state) {
    'ngInject';

    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.accountSelected = {
      type: '',
      clubCode: '',
      clubName: '',
      function: ''
    };
    this.accountChoices = [];

    Auth.getCurrentUser(currentUser => {
      this.accountSelected.type = 'club';
      this.accountSelected.clubCode = currentUser.club[0].clubCode;
      this.accountSelected.clubName = currentUser.club[0].clubName;
      this.accountSelected.function = currentUser.club[0].function;

      if(currentUser.individualAccount) this.accountChoices.push({type: 'individual'});
      if(currentUser.isPartOfClub) {
        currentUser.club.forEach(club => {
          this.accountChoices.push({type: 'club', clubCode: club.clubCode, clubName: club.clubName, function: club.function});
        });
      }
    });


    this.setAccount = function(type, clubCode) {
      if(type == 'individual') {
        this.accountSelected = {
          type: 'individual',
          clubCode: '',
          clubName: '',
          function: ''
        };
      }
      else if(type == 'club') {
        this.accountChoices.forEach(accountChoice => {
          if(accountChoice.clubCode == clubCode) {
            this.accountSelected.type = 'club';
            this.accountSelected.clubCode = clubCode;
            this.accountSelected.clubName = accountChoice.clubName;
            this.accountSelected.function = accountChoice.function;
          }
        });
      }
    }
  }

}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
