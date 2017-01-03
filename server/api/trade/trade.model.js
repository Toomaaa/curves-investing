'use strict';

import mongoose from 'mongoose';

var TradeSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

export default mongoose.model('Trade', TradeSchema);
