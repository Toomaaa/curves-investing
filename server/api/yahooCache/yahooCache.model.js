'use strict';

import mongoose from 'mongoose';

var YahooCacheSchema = new mongoose.Schema({
  request: Object,
  response: Object
});

export default mongoose.model('YahooCache', YahooCacheSchema);
