/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/subscriptions              ->  index
 * POST    /api/subscriptions              ->  create
 * GET     /api/subscriptions/:id          ->  show
 * PUT     /api/subscriptions/:id          ->  upsert
 * PATCH   /api/subscriptions/:id          ->  patch
 * DELETE  /api/subscriptions/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Subscription from './subscription.model';
import ClubsPeriods from '../clubsPeriods/clubsPeriods.model';
import Club from '../club/club.model';
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

// Gets a list of Subscriptions
export function index(req, res) {
  return Subscription.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Subscription from the DB
export function show(req, res) {
  return Subscription.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets all subscriptions from the DB by clubCode
export function showByClubCode(req, res, next) {

  var userId = req.user._id;

  var dateNow = new Date();
  var numberSubscriptionResults = 0;

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt

      if(!user || !user.accountSelected.clubCode) {
        return res.status(401).end();
      }

      Club.findOne({ clubCode: user.accountSelected.clubCode })
        .then (clubRes => {
          ClubsPeriods.findOne({ clubCode: user.accountSelected.clubCode })
            .then(periodsRes => {

              var members = [];
              var result = [];

              members.push(clubRes.president, clubRes.treasurer);
              members = members.concat(clubRes.members);

              members.forEach(member => {

                var newLength = result.push({ email: member.email, unpaid: [], totalSubscriptions: 0 });
                var index = newLength-1;

                var entryDate = new Date(member.entryDate);
                var memberPeriodsDues = [];

                periodsRes.periods.forEach(period => {
                  var periodCursor = new Date(period);
                  if(periodCursor >= entryDate && periodCursor <= dateNow) {
                    memberPeriodsDues.push(period);
                  }
                });

                var memberPeriodsUnpaid = [];

                Subscription.find({ clubCode: user.accountSelected.clubCode, email: member.email, type: 'initial' })
                  .then(response => {
                    if(response.length == 0) result[index].initial = false;
                    else result[index].initial = true;


                    // Subscription.find({ clubCode: user.accountSelected.clubCode, email: member.email })
                    Subscription.aggregate([ 
                      { 
                        $match : { 
                          clubCode : user.accountSelected.clubCode, 
                          email: member.email,
                          type: 'recurrent' 
                        } 
                      }, { 
                        $group : { 
                          _id : "$period",
                          email: { "$first": "$email" },
                          clubCode : { "$first": "$clubCode" },
                          amount: { 
                            $sum : "$amount" 
                          }
                        } 
                      } 
                    ])
                      .then(subscriptionsRes => {

                        numberSubscriptionResults++;

                        memberPeriodsDues.forEach(memberPeriod => {

                          function findSubscription(element) {
                            return element._id.getTime() == new Date(memberPeriod).getTime();
                          }

                          var found = subscriptionsRes.findIndex(findSubscription);

                          if(found == -1) {
                            result[index].unpaid.push({
                              startPeriod: memberPeriod,
                              endPeriod: periodsRes.periods[periodsRes.periods.indexOf(memberPeriod)+1],
                              amountDue: clubRes.monthlyAmount
                            });
                          }
                          else if(subscriptionsRes[found].amount < clubRes.monthlyAmount) {
                            result[index].unpaid.push({
                              startPeriod: memberPeriod,
                              endPeriod: periodsRes.periods[periodsRes.periods.indexOf(memberPeriod)+1],
                              amountDue: clubRes.monthlyAmount-subscriptionsRes[found].amount
                            });  
                            result[index].totalSubscriptions += subscriptionsRes[found].amount; 
                          }
                          else {
                            result[index].totalSubscriptions += subscriptionsRes[found].amount; 
                          }
                          
                        });

                        if(new Date(result[index].unpaid[0].endPeriod).getTime() < dateNow.getTime()) result[index].warning = true;
                        else result[index].warning = false;

                        if(numberSubscriptionResults == members.length) res.json(result);

                      });



                  })
                  .catch(err => {
                    result[index].unpaid.push({type: 'initial'});
                  });

                

              });

            });

        });


    })
    .catch(err => next(err));

}

// Creates a new Subscription in the DB
export function create(req, res) {
  return Subscription.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Subscription in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Subscription.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Subscription in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Subscription.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Subscription from the DB
export function destroy(req, res) {
  return Subscription.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
