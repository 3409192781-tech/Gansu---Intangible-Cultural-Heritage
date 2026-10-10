const mongoose = require('mongoose');

const SpotSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 4.5
  },
  reviews: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    default: 'spot'
  },
  area: {
    type: String,
    default: ''
  },
  level: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  isHot: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  videoUrl: {
    type: String,
    default: ''
  },
  openTime: {
    type: String,
    default: ''
  },
  ticketInfo: {
    type: String,
    default: ''
  },
  transport: {
    type: String,
    default: ''
  },
  tips: {
    type: [String],
    default: []
  },
  heritages: {
    type: [String],
    default: []
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  lat: {
    type: Number,
    default: null
  },
  lng: {
    type: Number,
    default: null
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

module.exports = mongoose.model('Spot', SpotSchema);