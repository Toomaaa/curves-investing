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
import Club from '../club/club.model';
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
              toPush.symbol = result.symbol;
              toPush.name = result.name;
              toPush.quantity = result.quantity;
              toPush.price = result.price;
              toPush.fees = result.fees;
              toPush.amount = -1*result.total;
              toPush.total = result.total;

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
              toPush.cashBalance = true;

              finalResult.push(toPush);
            }
            else if(tableResult.table === TreasuryMove) {
              var toPush = {};

              if(result.userId) toPush.userId = result.userId;
              if(result.clubCode) toPush.clubCode = result.clubCode;
              toPush.date = result.date;
              toPush.wording = result.libelle;
              toPush.amount = result.amount;
              toPush.cashGiven = result.cashGiven;
              toPush.cashBalance = true;

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







export function weekProgress(req, res, next) {

  var userId = req.user._id;
  var weeks = [];
  var result = {};

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }

      result.clubCode = user.accountSelected.clubCode;

      Club.findOne({ clubCode : user.accountSelected.clubCode })
        .then(club => {
          // find all end of weeks since the creation date
          if(club) var creationDate = new Date(club.creationDate);
          else var creationDate = new Date(user.signupDate);
          var dateNow = new Date();
          dateNow.setHours(11);
          dateNow.setMinutes(0);
          dateNow.setSeconds(0);
          dateNow.setMilliseconds(0);

          var cursorDate = new Date(creationDate);
          cursorDate.setHours(12);
          cursorDate.setMinutes(0);
          cursorDate.setSeconds(0);
          cursorDate.setMilliseconds(0);

          // find the first friday after the creation date
          var offsetToFriday = 5-creationDate.getDay();
          if(offsetToFriday<0) offsetToFriday += 7;

          cursorDate.setDate(creationDate.getDate()+offsetToFriday);

          while(cursorDate < dateNow) {
            weeks.push({ date: new Date(cursorDate) });
            cursorDate.setDate(cursorDate.getDate()+7);
          }
          weeks.push({date: dateNow});
          result.weeks = weeks;

          aggregateTables([Trade, Subscription, TreasuryMove], userId, user.accountSelected.clubCode)
            .then(result => {

              // for each week
              weeks.forEach(week => {

                // find the cash Given
                week.cashGiven = 0;
                week.cashBalance = 0;
                week.wallet = [];

                result.forEach(move => {

                  if(move.cashGiven && new Date(move.date) <= new Date(week.date)) {
                    week.cashGiven += move.amount;
                  }

                  if(move.cashBalance && new Date(move.date) <= new Date(week.date)) {
                    week.cashBalance += move.amount;
                  }

                  if(move.price && new Date(move.date) <= new Date(week.date)) {
                    week.cashBalance -= move.total;

                    var index = week.wallet.length;
                    for(var j=0; j<week.wallet.length; j++) {
                      if(move.symbol === week.wallet[j].symbol) index=j;
                    }

                    if(index == week.wallet.length) {
                      week.wallet[index] = {
                        quantity: 0,
                        total: 0,
                        symbol: '',
                        name : ''
                      };
                    }
                    week.wallet[index].symbol = move.symbol;
                    week.wallet[index].name = move.name;
                    week.wallet[index].quantity += move.quantity;
                    week.wallet[index].total += move.total;
                    if(week.wallet[index].quantity === 0) {
                      week.wallet.splice(week.wallet.indexOf(week.wallet[index]), 1);
                    }


                  }


                });

                

              });

              res.json(weeks);

            })
            .catch(err => {
              console.log(err);
              throw err;
            });


          // // Get all the subscriptions from the members
          // Subscription.find({clubCode : user.accountSelected.clubCode})
          //   .then(subscriptions => {

          //     Trade.find({clubCode : user.accountSelected.clubCode, orderDone: true})
          //       .then(trades => {

          //         // for each week
          //         weeks.forEach(week => {

          //           // find the cash Given
          //           week.cashGiven = 0;
          //           subscriptions.forEach(subscription => {
          //             if(new Date(subscription.period) <= new Date(week.date))
          //               week.cashGiven += subscription.amount;
          //           });

          //           // find the cash Balance
          //           week.cashBalance = week.cashGiven;
          //           trades.forEach(trade => {
          //             if(new Date(trade.date) <= new Date(week.date))
          //               week.cashBalance -= trade.total;
          //           });


          //           // find the wallet
          //           week.wallet = [];


          //           for(var i=0; i<trades.length; i++) {

          //             if(new Date(trades[i].date) <= new Date(week.date)) {

          //               var index = week.wallet.length;
          //               for(var j=0; j<week.wallet.length; j++) {
          //                 if(trades[i].symbol === week.wallet[j].symbol) index=j;
          //               }

          //               if(index == week.wallet.length) {
          //                 week.wallet[index] = {
          //                   quantity: 0,
          //                   total: 0,
          //                   symbol: '',
          //                   name : ''
          //                 };
          //               }
          //               week.wallet[index].symbol = trades[i].symbol;
          //               week.wallet[index].name = trades[i].name;
          //               week.wallet[index].quantity += trades[i].quantity;
          //               week.wallet[index].total += trades[i].total;
          //               if(week.wallet[index].quantity === 0) {
          //                 week.wallet.splice(week.wallet.indexOf(week.wallet[index]), 1);
          //               }
                        
          //             }

          //           }

          //         });

          //         res.json(weeks);

          //       })
          //       .catch(err => {
          //         console.log(err);
          //       });
          //   })
          //   .catch(err => {
          //     console.log(err);
          //   });

        })
        .catch(err => {
          console.log(err);
        })

    })
    .catch(err => {
      console.log(err);
    });

}
