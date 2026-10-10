const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    unique: true
  },
  nickName: {
    type: String,
    default: '微信用户'
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  collections: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
