/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/clubsPeriods              ->  index
 * POST    /api/clubsPeriods              ->  create
 * GET     /api/clubsPeriods/:id          ->  show
 * PUT     /api/clubsPeriods/:id          ->  upsert
 * PATCH   /api/clubsPeriods/:id          ->  patch
 * DELETE  /api/clubsPeriods/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import ClubsPeriods from './clubsPeriods.model';
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

// Gets a list of ClubsPeriodss
export function index(req, res, next) {
  var userId = req.user._id;

  console.log("ok ici : "+userId);

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt

      if(!user || !user.accountSelected.clubCode) {
        return res.status(401).end();
      }

      ClubsPeriods.findOne({ clubCode: user.accountSelected.clubCode }, function (err, response) {

        if(err) {
          console.log(err);
          return res.status(404).end();
        }

        var periods = [];

        var index = 0;

        for(var i=1; i<response.periods.length; i++) {
          periods[i-1] = {
            startPeriod : response.periods[i-1],
            endPeriod : response.periods[i]
          }
        }

        res.json(periods);

      });
      
    })
    .catch(err => next(err));

  
}

// Gets a single ClubsPeriods from the DB
export function show(req, res) {
  return ClubsPeriods.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new ClubsPeriods in the DB
export function create(req, res) {
  return ClubsPeriods.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given ClubsPeriods in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return ClubsPeriods.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing ClubsPeriods in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return ClubsPeriods.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a ClubsPeriods from the DB
export function destroy(req, res) {
  return ClubsPeriods.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
