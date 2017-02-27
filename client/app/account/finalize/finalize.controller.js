'use strict';

import angular from 'angular';

export default class FinalizeController {
  user = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };
  errors = {};
  submitted = false;


  /*@ngInject*/
  constructor(Auth, $state, $http, $scope, $stateParams) {
    this.Auth = Auth;
    this.$state = $state;
    this.$http = $http;
    this.$scope = $scope;

    this.$stateParams = $stateParams;

    this.user.email = $stateParams.email;
    this.user.activationCode = $stateParams.activationCode;

    $http.get('/api/pendings/'+this.user.email+'/'+this.user.activationCode)
      .then(response => {
        this.user = response.data;
      })
      .catch(function(e) {
        console.log("got an error in initial processing",e);
        throw e; // rethrow to not marked as handled, 
                 // in $q it's better to `return $q.reject(e)` here
      });




  }

  finalizeUser(form) {
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
        isPartOfClub: true,
        club: this.user.club,
        signupDate: new Date()
      })
        .then(() => {

          // Remove the user of the pending base
          this.$http.delete('/api/pendings/'+this.user._id);


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
