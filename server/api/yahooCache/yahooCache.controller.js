/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/yahooCaches              ->  index
 * POST    /api/yahooCaches              ->  create
 * GET     /api/yahooCaches/:id          ->  show
 * PUT     /api/yahooCaches/:id          ->  upsert
 * PATCH   /api/yahooCaches/:id          ->  patch
 * DELETE  /api/yahooCaches/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import YahooCache from './yahooCache.model';

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

// Gets a list of YahooCaches
export function index(req, res) {
  return YahooCache.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single YahooCache from the DB
export function show(req, res) {
  return YahooCache.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new YahooCache in the DB
export function create(req, res) {
  return YahooCache.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given YahooCache in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return YahooCache.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing YahooCache in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return YahooCache.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a YahooCache from the DB
export function destroy(req, res) {
  return YahooCache.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}


export function getCache(req, res) {

  return YahooCache.find({ "request.table" : req.params.table, "request.symbol" : req.params.symbol, "request.date" : req.params.date }).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));

}



export function postCache(req, res) {

  var object = { "request" : { "table" : req.params.table, "symbol" : req.params.symbol, "date" : req.params.date}, "response" : req.body };

  return YahooCache.create(object)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}