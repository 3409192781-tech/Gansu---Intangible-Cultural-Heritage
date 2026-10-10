const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    default: ''
  },
  linkType: {
    type: String,
    enum: ['detail', 'page', 'url'],
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

module.exports = mongoose.model('Banner', BannerSchema);