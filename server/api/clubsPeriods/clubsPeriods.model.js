'use strict';

import mongoose from 'mongoose';

var ClubsPeriodsSchema = new mongoose.Schema({
  clubCode: String,
  periods: Array
});

export default mongoose.model('ClubsPeriods', ClubsPeriodsSchema);
