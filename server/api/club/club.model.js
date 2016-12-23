'use strict';

import mongoose from 'mongoose';

var ClubSchema = new mongoose.Schema({
  clubCode: String,
  clubName: String,
  initialAmount: Number,
  monthlyAmount: Number,
  shareAmount: Number,
  creationDate: Date,
  exitPercentage: Number,
  members: Array,
  president: Object,
  treasurer: Object,
  pendingApproval: Array
});

export default mongoose.model('Club', ClubSchema);
