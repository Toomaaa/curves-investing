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
  constructor(Auth, $state) {
    this.Auth = Auth;
    this.$state = $state;
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
    this.submitted = true;
    console.log("ok ici");

    if(form.$valid) {
      return this.Auth.createClub({
        clubCode: 'ABCDE',
        clubName: 'BIC',
        initialAmount: 0,
        monthlyAmount: 100,
        shareAmount: 1,
        creationDate: '2012-04-23T18:25:43.511Z',
        exitPercentage: 2,
        members: [],
        president: { firstName: 'Guillaume', lastName: 'Bruno' },
        treasurer: { firstName : 'Thomas', lastName: 'Anicotte' },
        pendingApproval: []
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
}
