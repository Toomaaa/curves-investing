'use strict';

import mongoose from 'mongoose';

var TradeSchema = new mongoose.Schema({
  clubCode: String,
  date: Date,
  symbol: String,
  buyOrSell: String,
  orderDone: Boolean,
  orderType: String,
  quantity: Number,
  price: Number,
  limit1: Number,
  limit2: Number,
  fees: Number,
  total: Number
});

export default mongoose.model('Trade', TradeSchema);
