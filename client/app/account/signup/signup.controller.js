'use strict';

import angular from 'angular';

export default class SignupController {
  user = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };
  errors = {};
  submitted = false;


  /*@ngInject*/
  constructor(Auth, $state, $http) {
    this.Auth = Auth;
    this.$state = $state;
    this.$http = $http;
  }

  registerUser(form) {
    this.submitted = true;

    if(form.$valid) {
      return this.Auth.createUser({
        isActivated: true,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        password: this.user.password,
        isPasswordSet: true,
        individualAccount: false,
        isPartOfClub: false
      })
        .then(() => {
          // Account created, redirect to home
          this.$state.go('main');
        })
        .catch(err => {
          err = err.data;
          this.errors = {};
          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, (error, field) => {
            form[field].$setValidity('mongoose', false);
            this.errors[field] = error.message;
          });
        });
    }
  }

  registerClub(form) {
    this.$http.post('/api/clubs', {
      clubCode: 'ABCDE',
      clubName: this.club.clubName,
      initialAmount: this.club.initialAmount,
      monthlyAmount: this.club.monthlyAmount,
      shareAmount: this.club.shareAmount,
      creationDate: this.club.creationDate,
      exitPercentage: this.club.exitPercentage,
      members: [],
      president: { firstName: 'Guillaume', lastName: 'Bruno' },
      treasurer: { firstName : 'Thomas', lastName: 'Anicotte' },
      pendingApproval: []
    });
  }

}
