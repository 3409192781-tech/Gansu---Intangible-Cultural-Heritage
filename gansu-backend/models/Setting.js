const mongoose = require('mongoose');

// 站点设置 — key-value 存储，key 为唯一索引
const SettingSchema = new mongoose.Schema({
  key:        { type: String, required: true, unique: true },
  value:      { type: String, default: '' },
  label:      { type: String, default: '' },
  group:      { type: String, default: 'general' },
  updatedAt:  { type: Date, default: Date.now }
});

SettingSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model('Setting', SettingSchema);
