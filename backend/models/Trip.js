const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
  budgetType: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true,
  },
  interests: {
    type: [String], // array of strings, e.g. ["Food", "Adventure"]
    default: [],
  },
  itinerary: {
    type: Array, // we'll store day-by-day plan here
    default: [],
  },
  budgetEstimate: {
    type: Object, // flights, accommodation, food, activities, total
    default: {},
  },
  hotelSuggestions: {
    type: Array,
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);