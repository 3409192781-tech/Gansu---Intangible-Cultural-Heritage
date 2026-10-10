const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNo: {
    type: String,
    required: true,
    unique: true
  },
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunding'],
    default: 'pending'
  },
  deviceId: {
    type: String,
    default: ''
  },
  wxTransactionId: {
    type: String,
    default: ''
  },
  refundReason: {
    type: String,
    default: ''
  },
  refundStatus: {
    type: String,
    enum: [null, 'pending', 'approved', 'rejected'],
    default: null
  },
  refundedAt: {
    type: Date,
    default: null
  },
  logistics: {
    type: String,
    default: ''
  },
  logisticsCompany: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  paidAt: {
    type: Date,
    default: null
  },
  shippedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Order', OrderSchema);
