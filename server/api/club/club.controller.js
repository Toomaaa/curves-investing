/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/clubs              ->  index
 * POST    /api/clubs              ->  create
 * GET     /api/clubs/:id          ->  show
 * PUT     /api/clubs/:id          ->  upsert
 * PATCH   /api/clubs/:id          ->  patch
 * DELETE  /api/clubs/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Club from './club.model';
import User from '../user/user.model';
import Subscription from '../subscription/subscription.model';
import Trade from '../trade/trade.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Clubs
export function index(req, res) {
  return Club.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Club from the DB
export function show(req, res) {
  return Club.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Club from his clubCode from the DB
export function clubCodeGet(req, res) {
  return Club.findOne({ clubCode : req.params.clubCode }).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Club in the DB
export function create(req, res) {
  return Club.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Club in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Club.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Club in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Club.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Club from the DB
export function destroy(req, res) {
  return Club.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
