/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/pendings              ->  index
 * POST    /api/pendings              ->  create
 * GET     /api/pendings/:id          ->  show
 * PUT     /api/pendings/:id          ->  upsert
 * PATCH   /api/pendings/:id          ->  patch
 * DELETE  /api/pendings/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Pending from './pending.model';

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

// Gets a list of Pendings
export function index(req, res) {
  return Pending.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Pending from the DB
export function show(req, res) {
  return Pending.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Pending from the DB
export function getFinalize(req, res) {
  return Pending.findOne({ email : req.params.email, activationCode : req.params.activationCode }).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Pending in the DB
export function create(req, res) {
  return Pending.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Pending in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Pending.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Pending in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Pending.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Pending from the DB
export function destroy(req, res) {
  return Pending.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
