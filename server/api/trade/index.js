'use strict';

import * as auth from '../../auth/auth.service';

var express = require('express');
var controller = require('./trade.controller');

var router = express.Router();

router.get('/wallet', auth.isAuthenticated(), controller.wallet);
router.get('/orders', auth.isAuthenticated(), controller.orders);

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

module.exports = router;
