const mongoose = require('mongoose');

const QuickEntrySchema = new mongoose.Schema({
  icon: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  linkType: {
    type: String,
    enum: ['page', 'url'],
    default: 'page'
  },
  linkValue: {
    type: String,
    default: ''
  },
  sortOrder: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('QuickEntry', QuickEntrySchema);