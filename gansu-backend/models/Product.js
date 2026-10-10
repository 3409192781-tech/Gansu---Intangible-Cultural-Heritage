const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['artifact', 'textile', 'food_gift', 'stationery', 'home', 'accessory'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number,
    default: null
  },
  stock: {
    type: Number,
    default: 0
  },
  sold: {
    type: Number,
    default: 0
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
    default: 'product'
  },
  description: {
    type: String,
    default: ''
  },
  culturalStory: {
    type: String,
    default: ''
  },
  material: {
    type: String,
    default: ''
  },
  specification: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  tips: {
    type: [String],
    default: []
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isHot: {
    type: Boolean,
    default: false
  },
  limited: {
    type: Boolean,
    default: false
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

module.exports = mongoose.model('Product', ProductSchema);
