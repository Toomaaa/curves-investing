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
import Subscription from '../subscription/subscription.model';
import User from '../user/user.model';
import Pending from '../pending/pending.model';
import ClubsPeriods from '../clubsPeriods/clubsPeriods.model';
import TreasuryMove from '../treasuryMove/treasuryMove.model';



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

      aggregateTables([Trade, Subscription, TreasuryMove], userId, user.accountSelected.clubCode)
        .then(result => {

          var count=0;

          result.forEach(move => {

            var split = move.wording.split("#");
            if(split[0] == "Versement") {

              ClubsPeriods.findOne({clubCode: user.accountSelected.clubCode})
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
                    if(count == result.length * result.length) res.json(result);
                  }
                  else {
                    Pending.findOne({email: split[1]})
                      .then(resultPending => {
                        move.wording = "Versement "+resultPending.firstName+" "+resultPending.lastName;

                        count++;
                        if(count == result.length) res.json(result);
                      })
                      .catch(err => {
                        console.log(err);
                      });
                  }

                })
                .catch(err => {
                  console.log(err);
                })
            } else {
              count++;
              if(count == result.length) res.json(result);
            }

          });

        })
        .catch(err => {
          console.log(err);
          return res.status(404).end();
        });

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

      aggregateTables([Trade, Subscription, TreasuryMove], userId, user.accountSelected.clubCode)
        .then(result => {

          var count=0;

          result.forEach(move => {

            var split = move.wording.split("#");
            if(split[0] == "Versement") {

              ClubsPeriods.findOne({clubCode: user.accountSelected.clubCode})
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
                    if(count == result.length * result.length) res.json(result);
                  }
                  else {
                    Pending.findOne({email: split[1]})
                      .then(resultPending => {
                        move.wording = "Versement "+resultPending.firstName+" "+resultPending.lastName;

                        count++;
                        if(count == result.length) res.json(result);
                      })
                      .catch(err => {
                        console.log(err);
                      });
                  }

                })
                .catch(err => {
                  console.log(err);
                })
            } else {
              count++;
              if(count == result.length) res.json(result);
            }

          });

        })
        .catch(err => {
          console.log(err);
          return res.status(404).end();
        });
    })
    .catch(err => next(err));
}



function aggregateTables(tables, userId, clubCode) {

  return new Promise(function (resolve, reject) {

    var finalResult = [];

    queryTables(tables, userId, clubCode)
      .then(totalResult => {

        totalResult.forEach(tableResult => {

          tableResult.result.forEach(result => {

            if(tableResult.table === Trade) {
              var toPush = {};
              if(result.userId) toPush.userId = result.userId;
              if(result.clubCode) toPush.clubCode = result.clubCode;
              toPush.date = result.date;
              toPush.wording = (result.quantity >= 0 ? "Achat ": "Vente ")+result.name;
              toPush.quantity = result.quantity;
              toPush.price = result.price;
              toPush.fees = result.fees;
              toPush.amount = -1*result.total;

              finalResult.push(toPush);
            }
            else if(tableResult.table === Subscription) {
              var toPush = {};

              toPush.clubCode = result.clubCode;
              toPush.date = result.period;
              toPush.wording = "Versement#"+result.email;
              toPush.period = result.period;
              toPush.amount = result.amount;
              toPush.cashGiven = true;

              finalResult.push(toPush);
            }
            else if(tableResult.table === TreasuryMove) {
              var toPush = {};

              if(result.userId) toPush.userId = result.userId;
              if(result.clubCode) toPush.clubCode = result.clubCode;
              toPush.date = result.date;
              toPush.wording = result.libelle;
              toPush.amount = result.amount;
              toPush.cashGiven = true;

              finalResult.push(toPush);
            }
          });

        });


        finalResult.sort(function(a, b) {
          return a.date - b.date;
        });

        resolve(finalResult);

      })
      .catch(err => {
        throw err;
      });

  });

}


function queryTables(tables, userId, clubCode) {

  var countTable = 0;
  var totalResult = [];

  return new Promise(function (resolve, reject) {

    tables.forEach(table => {

      var match = {};
      if(clubCode) match.clubCode = clubCode;
      else match.userId = userId;

      if(table === Trade) match.orderDone = true;

      table.find(match, function (err, result) {
        totalResult.push({table: table, result: result});
        countTable++;

        if(countTable === tables.length) resolve(totalResult);
      });

    });

  });  

}