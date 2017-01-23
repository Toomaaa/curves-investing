'use strict';

var express = require('express');
var controller = require('./yahooCache.controller');

var router = express.Router();

router.get('/:table/:symbol/:date', controller.getCache);
router.post('/:table/:symbol/:date', controller.postCache);

router.get('/', controller.index);
// router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

module.exports = router;
