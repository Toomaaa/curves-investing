'use strict';

var express = require('express');
var controller = require('./pending.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/:email/:activationCode', controller.getFinalize);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

module.exports = router;
