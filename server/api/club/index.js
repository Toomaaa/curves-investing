'use strict';

import * as auth from '../../auth/auth.service';

var express = require('express');
var controller = require('./club.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/clubCode/:clubCode', controller.clubCodeGet);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

module.exports = router;
