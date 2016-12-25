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
    var members = angular.copy(this.$scope.members);

    var president = members.find(findPresident);
    members.splice(members.indexOf(president),1);
    var treasurer = members.find(findTreasurer);
    members.splice(members.indexOf(treasurer),1);


    generateClubCode(this.$http, this.club, function(clubCode, api, club) {
      api.post('/api/clubs', {
        clubCode: clubCode,
        clubName: club.clubName,
        initialAmount: club.initialAmount,
        monthlyAmount: club.monthlyAmount,
        shareAmount: club.shareAmount,
        creationDate: club.creationDate,
        exitPercentage: club.exitPercentage,
        members: members,
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
    });

    
    



    function findPresident(element) {
      return element.function == 'president';
    }
    function findTreasurer(element) {
      return element.function == 'treasurer';
    }
    function generateClubCode(api, clubData, callback)
    {
        var code = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        for( var i=0; i < 5; i++ )
          code += possible.charAt(Math.floor(Math.random() * possible.length));

        api.get('/api/clubs/clubCode/'+code)
          .then(function(response) {
            if(response.status === 200) { console.log("200"); generateClubCode(api, clubData, callback); }
          })
          .catch(function(response) {
            if(response.status === 404) { console.log("404"); callback(code, api, clubData); }
          })
          .finally(function() {
            console.log("ok finally");
          });
        
    }
  }



  

}
