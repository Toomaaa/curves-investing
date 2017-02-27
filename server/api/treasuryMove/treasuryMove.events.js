/**
 * TreasuryMove model events
 */

'use strict';

import {EventEmitter} from 'events';
var TreasuryMoveEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
TreasuryMoveEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(TreasuryMove) {
  for(var e in events) {
    let event = events[e];
    TreasuryMove.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    TreasuryMoveEvents.emit(event + ':' + doc._id, doc);
    TreasuryMoveEvents.emit(event, doc);
  };
}

export {registerEvents};
export default TreasuryMoveEvents;
