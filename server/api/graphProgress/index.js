'use strict';

import * as auth from '../../auth/auth.service';

var express = require('express');
var controller = require('./graphProgress.controller');

var router = express.Router();

router.post('/getCache', auth.isAuthenticated(), controller.getCache);
router.get('/:id', controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

module.exports = router;
