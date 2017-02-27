'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './treasuryMove.events';

var TreasuryMoveSchema = new mongoose.Schema({
  userId: String,
  clubCode: String,
  date: Date,
  libelle: String,
  amount: Number
});

registerEvents(TreasuryMoveSchema);
export default mongoose.model('TreasuryMove', TreasuryMoveSchema);
