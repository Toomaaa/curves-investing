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




export function weekProgress(req, res, next) {
  var userId = req.user._id;
  var weeks = [];
  var result = {};

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if(!user || !user.accountSelected.clubCode) {
        return res.status(401).end();
      }

      result.clubCode = user.accountSelected.clubCode;

      Club.findOne({ clubCode : user.accountSelected.clubCode })
        .then(club => {
          // find all end of weeks since the creation date
          var creationDate = new Date(club.creationDate);
          var dateNow = new Date();

          var cursorDate = new Date(creationDate);
          cursorDate.setHours(12);
          cursorDate.setMinutes(0);
          cursorDate.setSeconds(0);

          // find the first friday after the creation date
          var offsetToFriday = 5-creationDate.getDay();
          if(offsetToFriday<0) offsetToFriday += 7;

          cursorDate.setDate(creationDate.getDate()+offsetToFriday);

          while(cursorDate <= dateNow) {
            weeks.push({ date: new Date(cursorDate) });
            cursorDate.setDate(cursorDate.getDate()+7);
          }
          weeks.push({date: dateNow});
          result.weeks = weeks;


          // Get all the subscriptions from the members
          Subscription.find({clubCode : user.accountSelected.clubCode})
            .then(subscriptions => {

              Trade.find({clubCode : user.accountSelected.clubCode, orderDone: true})
                .then(trades => {

                  // for each week
                  weeks.forEach(week => {

                    console.log("==========================================");
                    console.log("==========================================");
                    console.log("NEW WEEK !");

                    // console.log("trades :");
                    // console.log(JSON.stringify(trades));
                    // console.log("...");

                    // find the cash Given
                    week.cashGiven = 0;
                    subscriptions.forEach(subscription => {
                      if(new Date(subscription.period) <= new Date(week.date))
                        week.cashGiven += subscription.amount;
                    });

                    // find the cash Balance
                    week.cashBalance = week.cashGiven;
                    trades.forEach(trade => {
                      if(new Date(trade.date) <= new Date(week.date))
                        week.cashBalance -= trade.total;
                    });


                    // find the wallet
                    week.wallet = [];


                    

                    for(var i=0; i<trades.length; i++) {

                      if(new Date(trades[i].date) <= new Date(week.date)) {

                        var index = week.wallet.length;
                        for(var j=0; j<week.wallet.length; j++) {
                          console.log(trades[i].symbol+" === "+week.wallet[j].symbol+" ==> "+(trades[i].symbol === week.wallet[j].symbol));
                          if(trades[i].symbol === week.wallet[j].symbol) index=j;
                          console.log(index);
                        }

                        if(index == week.wallet.length) {
                          week.wallet[index] = {
                            quantity: 0,
                            total: 0,
                            symbol: '',
                            name : ''
                          };
                        }
                        week.wallet[index].symbol = trades[i].symbol;
                        week.wallet[index].name = trades[i].name;
                        week.wallet[index].quantity += trades[i].quantity;
                        week.wallet[index].total += trades[i].total;
                        if(week.wallet[index].quantity === 0) {
                          week.wallet.splice(week.wallet.indexOf(week.wallet[index]), 1);
                        }
                        
                      }

                    }



                  });



                  res.json(weeks);

                })
                .catch(err => {
                  console.log(err);
                });
            })
            .catch(err => {
              console.log(err);
            });


          



          


        })
        .catch(err => {
          console.log(err);
        })

      

    })
    .catch(err => {
      console.log(err);
    });

}
