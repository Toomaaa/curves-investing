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
  constructor(Auth, $state, $http, $scope) {
    this.Auth = Auth;
    this.$state = $state;
    this.$http = $http;
    this.$scope = $scope;

    this.$scope.members = [
      { firstName: '', lastName: '', function: 'president', email: '' },
      { firstName: '', lastName: '', function: 'treasurer', email: '' },
      { firstName: '', lastName: '', function: 'member', email: '' },
      { firstName: '', lastName: '', function: 'member', email: '' },
      { firstName: '', lastName: '', function: 'member', email: '' },
    ];

    this.$scope.addMember = function() {
      if($scope.members.length < 20) $scope.members.push({ firstName: '', lastName: '', function: 'Membre', email: '' });
    };

    this.$scope.removeMember = function(i) {
      $scope.members.splice(i,1);
      if($scope.members.length < 5) { $scope.members.push({ firstName: '', lastName: '', function: 'Membre', email: '' }); }
    };
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
    var membersXX = this.$scope.members;

    var president = membersXX.find(findPresident);
    membersXX.splice(membersXX.indexOf(president),1);
    var treasurer = membersXX.find(findTreasurer);
    membersXX.splice(membersXX.indexOf(treasurer),1);


    this.$http.post('/api/clubs', {
        clubCode: 'ABCDE',
        clubName: this.club.clubName,
        initialAmount: this.club.initialAmount,
        monthlyAmount: this.club.monthlyAmount,
        shareAmount: this.club.shareAmount,
        creationDate: this.club.creationDate,
        exitPercentage: this.club.exitPercentage,
        members: membersXX,
        president: president,
        treasurer: treasurer,
        pendingApproval: []
      })
        .then(function(response) {
          console.log('then : '+response.data);
        })
        .catch(function(response) {
          console.log('catch : '+response.data);
        })
        .finally(function() {
          console.log('finally post');
        });
    



    function findPresident(element) {
      return element.function == 'president';
    }
    function findTreasurer(element) {
      return element.function == 'treasurer';
    }
    function generateClubCode($http, callback)
    {
        var code = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        for( var i=0; i < 5; i++ )
          code += possible.charAt(Math.floor(Math.random() * possible.length));

          // code = '';

        // $http.get('/api/clubs/clubCode/'+code)
        //   .then(function(response) {
        //     if(response.status === 200) { console.log("200"); generateClubCode(); }
        //   })
        //   .catch(function(response) {
        //     if(response.status === 404) { console.log("404"); callback(code); }
        //   })
        //   .finally(function() {
        //     console.log("ok finally");
        //   });
        callback(code);
        
    }
  }

}
