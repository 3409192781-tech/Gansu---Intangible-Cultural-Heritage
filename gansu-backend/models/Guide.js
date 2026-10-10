const mongoose = require('mongoose');

const GuideSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  coverImage: { type: String, required: true },
  summary: { type: String, default: '' },
  type: { type: String, enum: ['article', 'itinerary'], default: 'article' },
  category: { type: String, enum: ['family', 'self_drive', 'photo', 'deep', 'food', 'history', 'weekend', 'budget'], default: 'deep' },
  tags: { type: [String], default: [] },
  status: { type: Number, enum: [0, 1], default: 1 },

  // 通用
  content: { type: String, default: '' },               // 游记正文 (可含简单HTML)
  tips: { type: [String], default: [] },                 // 旅行贴士

  // 线路模式专用
  days: [{
    day: { type: Number, required: true },
    title: { type: String, default: '' },
    spots: { type: [String], default: [] },               // 景点名称列表
    description: { type: String, default: '' }
  }],

  // 元数据
  author: { type: String, default: '云游甘肃' },
  aiGenerated: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  isHot: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Guide', GuideSchema);
