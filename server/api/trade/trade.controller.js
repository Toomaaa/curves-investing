/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/trades              ->  index
 * POST    /api/trades              ->  create
 * GET     /api/trades/:id          ->  show
 * PUT     /api/trades/:id          ->  upsert
 * PATCH   /api/trades/:id          ->  patch
 * DELETE  /api/trades/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Trade from './trade.model';
import User from '../user/user.model';
import Pending from '../pending/pending.model';
import ClubsPeriods from '../clubsPeriods/clubsPeriods.model';



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

// Gets a list of Trades
export function index(req, res) {
  return Trade.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Trade from the DB
export function show(req, res) {
  return Trade.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Trade in the DB
export function create(req, res) {

  var userId = req.user._id;

  if(!req.body.clubCode) req.body.userId = String(userId);

  return Trade.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Trade in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Trade.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Trade in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Trade.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Trade from the DB
export function destroy(req, res) {
  return Trade.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}


export function wallet(req, res, next) {
  var userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }

      var match = { "orderDone" : true };
      if(user.accountSelected.clubCode) {
        match.clubCode = user.accountSelected.clubCode;
      }
      else {
        match.userId = String(userId);
      }

      Trade.aggregate( 
        [ 
          { 
            $match : match
          }, { 
            $group : { 
              _id : "$symbol",
              name: { "$first": "$name" },
              quantity: { 
                $sum : "$quantity" 
              }, 
              totalPrice: { 
                $sum: { 
                  $sum: [ 
                    {
                      $multiply: [ "$quantity", "$price" ]
                    }, 
                    "$fees"
                  ] 
                } 
              }
            } 
          } 
        ], function(err, result) {

          if(err) {
            console.log(err);
            return res.status(404).end();
          }

          result.forEach(res => {
            if(res.quantity === 0) {
              result.splice(result.indexOf(res), 1);
            }
          });
          res.json(result);

        }
      );
    })
    .catch(err => next(err));
}



export function orders(req, res, next) {
  var userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }

      var match = { "orderDone" : false };
      if(user.accountSelected.clubCode) {
        match.clubCode = user.accountSelected.clubCode;
      }
      else {
        match.userId = String(userId);
      }

      Trade.find(match, function(err, result) {

          if(err) {
            console.log(err);
            return res.status(404).end();
          }

          res.json(result);

        }
      );
    })
    .catch(err => next(err));
}




export function treasury(req, res, next) {
  var userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }

      var match = { "orderDone" : true };
      var query;
      if(user.accountSelected.clubCode) {
        match.clubCode = user.accountSelected.clubCode;

        query = [
                    {
                        "$match" : match
                    },
                    {
                        "$lookup": {
                            "from": "subscriptions",
                            "localField": "clubCode",
                            "foreignField": "clubCode",
                            "as": "subs"
                        }
                    },
                    { "$unwind": "$subs" },
                    {
                        "$group": {
                            "_id": "$clubCode",
                            "trades": {
                                "$push": {
                                    "date": "$date",
                                    "wording": { "$concat": [ { $cond: { if: { $gte: [ "$quantity", 0 ] }, then: "Achat ", else: "Vente " } }, "$name"] },
                                    "amount": {$multiply: [-1, "$total"]}
                                }
                            },
                            "subs": {
                                "$push": {
                                    "date": "$subs.period",
                                    "wording": { "$concat": ["Versement#", "$subs.email"] },
                                    "period" : "$subs.period",
                                    "amount": "$subs.amount"
                                }
                            }
                        }
                    },
                    {
                        "$project": {
                            "clubCode": "$_id",
                            "_id": 0,
                            "treasury_moves": { "$setUnion": ["$subs", "$trades"] }
                        }
                    },
                    { "$unwind": "$treasury_moves" },
                    { 
                        "$sort" : { "treasury_moves.date" : 1 }
                    },
                    {
                        "$group": {
                            "_id": "$clubCode",
                            "treasury_moves": {
                                "$push" : "$treasury_moves"
                            }
                        }
                    },
                    {
                        "$project": {
                            "clubCode": "$_id",
                            "_id": 0,
                            "treasury_moves": 1
                        }
                    }
                ];
      }
      else {
        match.userId = String(userId);

        query = [
                    {
                        "$match" : match
                    },
                    {
                        "$project": {
                            "userId": 1,
                            "date": 1,
                            "wording": { "$concat": [ { $cond: { if: { $gte: [ "$quantity", 0 ] }, then: "Achat ", else: "Vente " } }, "$name"] },
                            "amount": {$multiply: [-1, "$total"]}
                        }
                    },
                    { 
                        "$sort" : { "date" : 1 }
                    },
                    {
                        "$group": {
                            "_id": "$userId",
                            "treasury_moves": {
                                "$push" : {"date": "$date", "wording": "$wording", "amount": "$amount"}
                            }
                        }
                    },
                    {
                        "$project": {
                            "userId": "$_id",
                            "_id": 0,
                            "treasury_moves": 1
                        }
                    }
                ];
      }

      Trade.aggregate(query, function(err, result) {

          if(err) {
            console.log(err);
            return res.status(404).end();
          }

          var count=0;

          result.forEach(resultOne => {
            resultOne.treasury_moves.forEach(move => {
              var split = move.wording.split("#");
              if(split[0] == "Versement") {

                match.orderDone = undefined;

                ClubsPeriods.findOne(match)
                  .then(resultPeriods => {
                    for(var i=0; i<resultPeriods.periods.length; i++) {
                      if(new Date(resultPeriods.periods[i]).getTime() == new Date(move.period).getTime()) {
                        move.period = new Date(move.period);
                        move.periodEnd = new Date(resultPeriods.periods[i+1]);
                      }
                    }
                  })
                  .catch(err => {
                    console.log(err);
                  })

                User.findOne({email: split[1]}, '-salt -password')
                  .then(resultUser => {
                    
                    if(resultUser) {
                      move.wording = "Versement "+resultUser.firstName+" "+resultUser.lastName;
                      
                      count++;
                      if(count == result.length * resultOne.treasury_moves.length) res.json(result);
                    }
                    else {
                      Pending.findOne({email: split[1]})
                        .then(resultPending => {
                          move.wording = "Versement "+resultPending.firstName+" "+resultPending.lastName;

                          count++;
                          if(count == result.length * resultOne.treasury_moves.length) res.json(result);
                        })
                        .catch(err => {
                          console.log(err);
                        })
                    }

                  })
                  .catch(err => {
                    console.log(err);
                  })
              } else {
                count++;
                if(count == result.length * resultOne.treasury_moves.length) res.json(result);
              }

            });
          });

          

        }
      )
    })
    .catch(err => next(err));
}









export function accountHistory(req, res, next) {
  var userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }

      var match = { "orderDone" : true };
      var query;
      if(user.accountSelected.clubCode) {
        match.clubCode = user.accountSelected.clubCode;
        query = [
                    {
                        "$match" : match
                    },
                    {
                        "$lookup": {
                            "from": "subscriptions",
                            "localField": "clubCode",
                            "foreignField": "clubCode",
                            "as": "subs"
                        }
                    },
                    { "$unwind": "$subs" },
                    {
                        "$group": {
                            "_id": "$clubCode",
                            "trades": {
                                "$push": {
                                    "date": "$date",
                                    "wording": { "$concat": [ { $cond: { if: { $gte: [ "$quantity", 0 ] }, then: "Achat ", else: "Vente " } }, "$name"] },
                                    "quantity": "$quantity",
                                    "price": "$price",
                                    "fees": "$fees",
                                    "amount": {$multiply: [-1, "$total"]} //{ $cond: { if: { $gte: [ "$quantity", 0 ] }, then: {$multiply: [-1, "$total"]}, else: "$total" } }
                                }
                            },
                            "subs": {
                                "$push": {
                                    "date": "$subs.period",
                                    "wording": { "$concat": ["Versement#", "$subs.email"] },
                                    "period" : "$subs.period",
                                    "amount": "$subs.amount"
                                }
                            }
                        }
                    },
                    {
                        "$project": {
                            "clubCode": "$_id",
                            "_id": 0,
                            "accountHistory_moves": { "$setUnion": ["$subs", "$trades"] }
                        }
                    },
                    { "$unwind": "$accountHistory_moves" },
                    { 
                        "$sort" : { "accountHistory_moves.date" : 1 }
                    },
                    {
                        "$group": {
                            "_id": "$clubCode",
                            "accountHistory_moves": {
                                "$push" : "$accountHistory_moves"
                            }
                        }
                    },
                    {
                        "$project": {
                            "clubCode": "$_id",
                            "_id": 0,
                            "accountHistory_moves": 1
                        }
                    }
                ];
      }
      else {
        match.userId = String(userId);
        query = [
                    {
                        "$match" : match
                    },
                    {
                        "$project": {
                            "userId": 1,
                            "date": "$date",
                            "wording": { "$concat": [ { $cond: { if: { $gte: [ "$quantity", 0 ] }, then: "Achat ", else: "Vente " } }, "$name"] },
                            "quantity": "$quantity",
                            "price": "$price",
                            "fees": "$fees",
                            "amount": {$multiply: [-1, "$total"]}
                        }
                    },
                    { 
                        "$sort" : { "date" : 1 }
                    },
                    {
                        "$group": {
                            "_id": "$userId",
                            "accountHistory_moves": {
                                "$push" : {"date": "$date", "wording": "$wording", "quantity": "$quantity", "price": "$price", "fees": "$fees", "amount": "$amount"}
                            }
                        }
                    },
                    {
                        "$project": {
                            "userId": "$_id",
                            "_id": 0,
                            "accountHistory_moves": 1
                        }
                    }
                ];
      }

      Trade.aggregate(query, function(err, result) {

          if(err) {
            console.log(err);
            return res.status(404).end();
          }

          var count=0;

          result.forEach(resultOne => {
            resultOne.accountHistory_moves.forEach(move => {
              var split = move.wording.split("#");
              if(split[0] == "Versement") {

                ClubsPeriods.findOne({clubCode: resultOne.clubCode})
                  .then(resultPeriods => {
                    for(var i=0; i<resultPeriods.periods.length; i++) {
                      if(new Date(resultPeriods.periods[i]).getTime() == new Date(move.period).getTime()) {
                        move.period = new Date(move.period);
                        move.periodEnd = new Date(resultPeriods.periods[i+1]);
                      }
                    }
                  })
                  .catch(err => {
                    console.log(err);
                  })

                User.findOne({email: split[1]}, '-salt -password')
                  .then(resultUser => {
                    
                    if(resultUser) {
                      move.wording = "Versement "+resultUser.firstName+" "+resultUser.lastName;
                      
                      count++;
                      if(count == result.length * resultOne.accountHistory_moves.length) res.json(result);
                    }
                    else {
                      Pending.findOne({email: split[1]})
                        .then(resultPending => {
                          move.wording = "Versement "+resultPending.firstName+" "+resultPending.lastName;

                          count++;
                          if(count == result.length * resultOne.accountHistory_moves.length) res.json(result);
                        })
                        .catch(err => {
                          console.log(err);
                        })
                    }

                  })
                  .catch(err => {
                    console.log(err);
                  })
              } else {
                count++;
                if(count == result.length * resultOne.accountHistory_moves.length) res.json(result);
              }

            });
          });

          // res.json(result);
          

        }
      )
    })
    .catch(err => next(err));
}
