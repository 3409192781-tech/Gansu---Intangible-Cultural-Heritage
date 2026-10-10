const mongoose = require('mongoose');

// 独立收藏集合 — 按 deviceId 索引，不依赖 User/WeChat openid
const FavoriteSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  itemId:   { type: String, required: true },
  type:     { type: String, default: 'spot' },          // spot / culture / food / product
  createdAt:{ type: Date, default: Date.now }
});

FavoriteSchema.index({ deviceId: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
