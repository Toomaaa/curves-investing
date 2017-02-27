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

    this.$scope.club = {
      creationDate: new Date(),
      initialAmount: 1000,
      monthlyAmount: 100,
      shareAmount: 1,
      exitPercentage: 2
    };

    this.$scope.club.periods = {
      weekday : {
        number : '1',
        day: '1',
        regularity: '1'
      },
      fixed : {
        number : '1',
        regularity: '1'
      },
      weekdayMode : true
    };

    this.$scope.club.endFirstPeriods = calculatePeriods({mode: "weekday", number: 1, day: 1, regularity: 1}, this.$scope.club.creationDate, 2);

    this.$scope.club.endFirstPeriod = '0';

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

    this.$scope.changeMode = function(ctrl, mode) {
      if(mode == 'weekday') $scope.club.periods.weekdayMode = true;
      else if(mode == 'fixed') $scope.club.periods.weekdayMode = false;

      var periods = { }
      if($scope.club.periods.weekdayMode) {
        periods.mode = "weekday";
        periods.number = $scope.club.periods.weekday.number;
        periods.day = $scope.club.periods.weekday.day;
        periods.regularity = 1;
      } else {
        periods.mode = "fixed";
        periods.number = $scope.club.periods.fixed.number;
        periods.regularity = 1;
      }

      if(mode == 'weekday') $scope.club.endFirstPeriods = calculatePeriods(periods, $scope.club.creationDate, parseInt($scope.club.periods.weekday.regularity)+1);
      else if(mode == 'fixed') {
        $scope.club.endFirstPeriods = calculatePeriods(periods, $scope.club.creationDate, parseInt($scope.club.periods.fixed.regularity)+1);
      }
    }

    this.$scope.clubSubmitted = false;




    function calculatePeriods(periodsConfig, creationDate, limit, endFirstPeriod) {

      
      if(endFirstPeriod) {
        endFirstPeriod = new Date($scope.club.endFirstPeriods[endFirstPeriod]);
      }

      var periodsDates = new Array();

      var creationDay = creationDate.getDate();
      var creationMonth = creationDate.getMonth();
      var creationYear = creationDate.getFullYear();

      var cursorDate = new Date(creationDate);
      if(endFirstPeriod) periodsDates.push(cursorDate);
      var endDate = new Date(creationYear+10, creationMonth, creationDay);

      if(!limit) limit=999;
      var count = 0;

      if(periodsConfig.mode == "weekday") {

        cursorDate = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), 1);

        while(cursorDate <= endDate && count < limit) {

          var firstDay = cursorDate.getDay();
          var diff = parseInt(periodsConfig.day) - firstDay;
          if(diff < 0) diff = diff+7;
          var goodDay = diff + (parseInt(periodsConfig.number)-1)*7 + 1;

          cursorDate = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), goodDay);

          if(((endFirstPeriod && cursorDate >= endFirstPeriod) || (endFirstPeriod===undefined && cursorDate >= creationDate)) && cursorDate <= endDate) {
            periodsDates.push(new Date(+cursorDate));
            count++;
          }

          cursorDate = new Date(cursorDate.getFullYear(), cursorDate.getMonth()+parseInt(periodsConfig.regularity), 1);
        }

      }
      else if(periodsConfig.mode == "fixed") {

        // On fixe le jour du mois à celui demandé, et on regarde si on a pas basculé sur le mois suivant (par exemple pour un 31 février)
        var currentMonth = cursorDate.getMonth();
        cursorDate = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), parseInt(periodsConfig.number));
        if(cursorDate.getMonth() != currentMonth+1 && cursorDate.getMonth()!=0) cursorDate = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), 0);

        while(cursorDate <= endDate && count < limit) {

          if(((endFirstPeriod && cursorDate >= endFirstPeriod) || (endFirstPeriod===undefined && cursorDate >= creationDate)) && cursorDate <= endDate) {
            periodsDates.push(new Date(+cursorDate));
            count++;
          }

          currentMonth = cursorDate.getMonth();
          cursorDate = new Date(cursorDate.getFullYear(), cursorDate.getMonth()+parseInt(periodsConfig.regularity), parseInt(periodsConfig.number));
          if(cursorDate.getMonth() != currentMonth+parseInt(periodsConfig.regularity) && cursorDate.getMonth()!=0) cursorDate = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), 0);
        }

      }

      return periodsDates;
    }

    $scope.calculatePeriods = calculatePeriods;


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
        isPartOfClub: false,
        signupDate: new Date()
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

      var periods = { }
      if(this.$scope.club.periods.weekdayMode) {
        periods.mode = "weekday";
        periods.number = this.$scope.club.periods.weekday.number;
        periods.day = this.$scope.club.periods.weekday.day;
        periods.regularity = this.$scope.club.periods.weekday.regularity;
      } else {
        periods.mode = "fixed";
        periods.number = this.$scope.club.periods.fixed.number;
        periods.regularity = this.$scope.club.periods.fixed.regularity;
      }

      generateClubCode(this.$http, this.$scope, this.$scope.club, function(clubCode, api, scope, club) {

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
          pendingApproval: [],
          periods: periods
        })
          .then(function(response) {

            api.post('/api/clubsPeriods', {
              clubCode: clubCode,
              periods: scope.calculatePeriods(periods, club.creationDate, 999, club.endFirstPeriod)
            });
            
            scope.members.forEach(function(member) {

              api.post('/api/pendings', {
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email,
                club: [ { clubCode: clubCode, function: member.function } ],
                activationCode: generateActivationCode()
              });

              if(club.initialAmount == 0) api.post('/api/subscriptions', {
                email: member.email,
                clubCode: clubCode,
                period: club.creationDate,
                amount: club.initialAmount,
                type: 'initial'
              });
              
            });
              
            scope.clubSubmitted = true;
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
            if(response.status === 200) { generateClubCode(api, scope, clubData, callback); }
          })
          .catch(function(response) {
            if(response.status === 404) { callback(code, api, scope, clubData); }
          });
        
    }

    function generateActivationCode()
    {
        var code = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        for( var i=0; i < 20; i++ )
          code += possible.charAt(Math.floor(Math.random() * possible.length));

        return code;
        
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
