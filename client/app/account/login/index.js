'use strict';

import angular from 'angular';
import LoginController from './login.controller';

export default angular.module('curvesInvestingApp.login', [])
  .controller('LoginController', LoginController)
  .name;
