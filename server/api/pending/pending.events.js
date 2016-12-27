/**
 * Pending model events
 */

'use strict';

import {EventEmitter} from 'events';
import Pending from './pending.model';
var PendingEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PendingEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Pending.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    PendingEvents.emit(event + ':' + doc._id, doc);
    PendingEvents.emit(event, doc);
  };
}

export default PendingEvents;
