/**
 * YahooCache model events
 */

'use strict';

import {EventEmitter} from 'events';
import YahooCache from './yahooCache.model';
var YahooCacheEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
YahooCacheEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  YahooCache.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    YahooCacheEvents.emit(event + ':' + doc._id, doc);
    YahooCacheEvents.emit(event, doc);
  };
}

export default YahooCacheEvents;
