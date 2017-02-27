'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './treasuryMove.routes';

export class TreasuryMoveComponent {
  /*@ngInject*/
  constructor($scope, $http, userSelection) {
    
    $scope.validated = false;
    $scope.date = new Date();

    $scope.formValidation = function () {

      var club = userSelection.get('accountSelected');

      var data = {
        clubCode: club.clubCode != '' ? club.clubCode : undefined,
        date: $scope.date,
        libelle: $scope.libelle,
        amount: ($scope.debitOrCredit == 'debit' ? -1 : 1)*$scope.amount
      };

      $http.post('/api/treasuryMoves', data)
        .then(result => {

          $scope.validated = true;

          $scope.validationText = "Ajout d'un ";
          $scope.validationText += $scope.debitOrCredit == 'debit' ? "débit" : "crédit";
          $scope.validationText += " de "+$scope.amount+" € le ";
          $scope.validationText += $scope.date.getDate() > 9 ? $scope.date.getDate() : '0'+$scope.date.getDate();
          $scope.validationText += "/";
          $scope.validationText += ($scope.date.getMonth()+1) > 9 ? ($scope.date.getMonth()+1) : '0'+($scope.date.getMonth()+1);
          $scope.validationText += "/";
          $scope.validationText += $scope.date.getFullYear();
          $scope.validationText += " : "+$scope.libelle;


          $scope.debitOrCredit = undefined;
          $scope.libelle = undefined;
          $scope.amount = undefined;

        })
        .catch(err => {
          console.log(err);
          throw err;
        });

    };

  }
}


TreasuryMoveComponent.$inject = ["$scope", "$http", "userSelection"];

export default angular.module('curvesInvestingApp.treasuryMove', [uiRouter])
  .config(routes)
  .component('treasuryMove', {
    template: require('./treasuryMove.html'),
    controller: TreasuryMoveComponent,
    controllerAs: 'treasuryMoveCtrl'
  })
  .name;
