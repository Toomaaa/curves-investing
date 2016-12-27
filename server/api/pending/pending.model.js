'use strict';

import mongoose from 'mongoose';

var PendingSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  club: Array,
  activationCode: String
});

export default mongoose.model('Pending', PendingSchema);
