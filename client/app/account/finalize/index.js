'use strict';

import angular from 'angular';
import SignupController from './finalize.controller';

export default angular.module('curvesInvestingApp.finalize', [])
  .controller('FinalizeController', SignupController)
  .name;
