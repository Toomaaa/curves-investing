/**
 * GraphProgress model events
 */

'use strict';

import {EventEmitter} from 'events';
import GraphProgress from './graphProgress.model';
var GraphProgressEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
GraphProgressEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  GraphProgress.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    GraphProgressEvents.emit(event + ':' + doc._id, doc);
    GraphProgressEvents.emit(event, doc);
  };
}

export default GraphProgressEvents;
