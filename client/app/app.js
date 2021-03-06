'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import 'angular-socket-io';

import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
// import ngMessages from 'angular-messages';
// import ngValidationMatch from 'angular-validation-match';


import {
  routeConfig
} from './app.config';

import _Auth from '../components/auth/auth.module';
import account from './account';
import MembersListComponent from './members-list/members-list.component';
import BuysellComponent from './buysell/buysell.component';
import WalletComponent from './wallet/wallet.component';
import TreasuryComponent from './treasury/treasury.component';
import TreasuryMoveComponent from './treasuryMove/treasuryMove.component';
import AccountHistoryComponent from './accountHistory/accountHistory.component';
import GraphProgressComponent from './graphProgress/graphProgress.component';
import userSelection from './userSelection/userSelection.service';
import quotesName from './yahoo/quotesName/quotesName.service';
import quotes from './yahoo/quotes/quotes.service';
import historicalQuotes from './yahoo/historicalQuotes/historicalQuotes.service';
import yahooRequest from './yahoo/yahooRequest/yahooRequest.service';
import admin from './admin';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';

import '../../node_modules/angular-google-chart/ng-google-chart';

import './app.css';

angular.module('curvesInvestingApp', [ngCookies, ngResource, ngSanitize, 'btford.socket-io',
  uiRouter, 
  uiBootstrap, 
  _Auth, 
  account, 
  MembersListComponent, 
  BuysellComponent, 
  WalletComponent, 
  TreasuryComponent, 
  TreasuryMoveComponent,
  AccountHistoryComponent, 
  GraphProgressComponent, 
  userSelection, 
  quotesName, 
  quotes, 
  historicalQuotes, 
  yahooRequest, 
  admin, 
  navbar, 
  footer, 
  main, 
  constants, 
  socket, 
  util,
  'googlechart'
])
  .config(routeConfig)
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in

    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if(next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['curvesInvestingApp'], {
      strictDi: true
    });
  });
