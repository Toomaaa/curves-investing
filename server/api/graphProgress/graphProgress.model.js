'use strict';

import mongoose from 'mongoose';

var GraphProgressSchema = new mongoose.Schema({
	userId: String,
	clubCode: String,
	startDate: Date,
	endDate: Date,
	weeks: Array
});

export default mongoose.model('GraphProgress', GraphProgressSchema);
