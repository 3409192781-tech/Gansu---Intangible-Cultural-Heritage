const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true
  },
  day: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: Number,
    enum: [0, 1],
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', EventSchema);