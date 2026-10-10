const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  desc: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  level: {
    type: String,
    default: ''
  },
  years: {
    type: String,
    default: ''
  },
  intro: {
    type: String,
    default: ''
  },
  heritages: {
    type: [{
      id: String,
      name: String,
      image: String,
      desc: String,
      tags: [String],
      level: String
    }],
    default: []
  },
  spots: {
    type: [String],
    default: []
  },
  foods: {
    type: [String],
    default: []
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

module.exports = mongoose.model('City', CitySchema);