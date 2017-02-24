/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/graphProgress              ->  index
 * POST    /api/graphProgress              ->  create
 * GET     /api/graphProgress/:id          ->  show
 * PUT     /api/graphProgress/:id          ->  upsert
 * PATCH   /api/graphProgress/:id          ->  patch
 * DELETE  /api/graphProgress/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import GraphProgress from './graphProgress.model';
import User from '../user/user.model';

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

// Gets a list of GraphProgresss
export function getCache(req, res) {
  console.log("===========================");
  console.log('.find({startDate: {$eq: '+req.body.startDate+'}, endDate: {$lte: '+req.body.endDate+'}})');
  console.log("===========================");
  return GraphProgress.find({startDate: {$eq: req.body.startDate}, endDate: {$lte: req.body.endDate}}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single GraphProgress from the DB
export function show(req, res) {
  return GraphProgress.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new GraphProgress in the DB
export function create(req, res) {

  var userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }

      if(user.accountSelected.clubCode) { req.body.clubCode = user.accountSelected.clubCode; }
      else { req.body.userId = userId; }

      return GraphProgress.create(req.body)
      .then(respondWithResult(res, 201))
      .catch(handleError(res));

    })
    .catch(err => {
      console.log(err);
    });
  
}

// Upserts the given GraphProgress in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return GraphProgress.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing GraphProgress in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return GraphProgress.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a GraphProgress from the DB
export function destroy(req, res) {
  return GraphProgress.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
