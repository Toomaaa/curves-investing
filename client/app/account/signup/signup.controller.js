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
      if($scope.members.length < 20) $scope.members.push({ firstName: '', lastName: '', function: 'member', email: '' });
    };

    this.$scope.removeMember = function(i) {
      $scope.members.splice(i,1);
      if($scope.members.length < 5) { $scope.members.push({ firstName: '', lastName: '', function: 'member', email: '' }); }
    };

    this.$scope.clubSubmitted = false;


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

    if(form.$valid) {
      var members = angular.copy(this.$scope.members);

      var president = members.find(findPresident);
      members.splice(members.indexOf(president),1);
      var treasurer = members.find(findTreasurer);
      members.splice(members.indexOf(treasurer),1);


      generateClubCode(this.$http, this.$scope, this.club, function(clubCode, api, scope, club) {
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
            
            scope.members.forEach(function(member) {

              // generateFakePassword(function(fakePassword) {
                api.post('/api/users', {
                  isActivated: false,
                  firstName: member.firstName,
                  lastName: member.lastName,
                  email: member.email,
                  password: generateFakePassword(),
                  isPasswordSet: false,
                  individualAccount: false,
                  isPartOfClub: true,
                  club: [ { clubCode: clubCode, status: 'Approved', function: member.function } ]
                })
                  .then(function(response) {
                    console.log("then post 2 : ");
                    console.log(response);
                  })
                  .catch(function(response) {

                    console.log("catch post 2 : ");
                    console.log(response);
                  })
                  .finally(function() {
                    console.log("finally 2");
                  });
              // });

              
            });
              
            scope.clubSubmitted = true;
          })
          .catch(function(response) {
            console.log('catch : '+response.data);
          })
          .finally(function() {
            console.log('finally post');
          });
      });
    }
    


    function findPresident(element) {
      return element.function == 'president';
    }
    function findTreasurer(element) {
      return element.function == 'treasurer';
    }
    function generateClubCode(api, scope, clubData, callback)
    {
        var code = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        for( var i=0; i < 5; i++ )
          code += possible.charAt(Math.floor(Math.random() * possible.length));

        api.get('/api/clubs/clubCode/'+code)
          .then(function(response) {
            if(response.status === 200) { console.log("200"); generateClubCode(api, scope, clubData, callback); }
          })
          .catch(function(response) {
            if(response.status === 404) { console.log("404"); callback(code, api, scope, clubData); }
          })
          .finally(function() {
            console.log("ok finally");
          });
        
    }

    function generateFakePassword()
    {
        var passwd = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?#._-";

        for( var i=0; i < 15; i++ )
          passwd += possible.charAt(Math.floor(Math.random() * possible.length));

        return passwd;
    }
  }



  

}
