'use strict';

import mongoose from 'mongoose';

var SubscriptionSchema = new mongoose.Schema({
  email: String,
  clubCode: String,
  period: Date,
  amount: Number,
  type: String
});

export default mongoose.model('Subscription', SubscriptionSchema);
