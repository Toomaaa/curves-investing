'use strict';

export default class SettingsController {
  user = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  errors = {
    other: undefined
  };
  message = '';
  submitted = false;


  /*@ngInject*/
  constructor(Auth, $http, $scope) {
    this.Auth = Auth;


    $http.get('/api/users/me').then(function(response) {
      $scope.isPasswordSet = response.data.isPasswordSet;
    });
  }

  changePassword(form) {
    this.submitted = true;

    if(form.$valid) {
      this.Auth.changePassword(this.user.oldPassword, this.user.newPassword)
        .then(() => {
          this.message = 'Mot de passe mis à jour.';
          // voir pour rediriger vers la page d'accueil ?
        })
        .catch(() => {
          form.password.$setValidity('mongoose', false);
          this.errors.other = 'Mot de passe incorrect';
          this.message = '';
        });
    }
  }
}
