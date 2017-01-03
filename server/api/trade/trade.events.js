/**
 * Trade model events
 */

'use strict';

import {EventEmitter} from 'events';
import Trade from './trade.model';
var TradeEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
TradeEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Trade.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    TradeEvents.emit(event + ':' + doc._id, doc);
    TradeEvents.emit(event, doc);
  };
}

export default TradeEvents;
