/**
 * ClubsPeriods model events
 */

'use strict';

import {EventEmitter} from 'events';
import ClubsPeriods from './clubsPeriods.model';
var ClubsPeriodsEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ClubsPeriodsEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  ClubsPeriods.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    ClubsPeriodsEvents.emit(event + ':' + doc._id, doc);
    ClubsPeriodsEvents.emit(event, doc);
  };
}

export default ClubsPeriodsEvents;
