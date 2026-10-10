const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const { protect } = require('../middleware/auth');
const { success, error, pagination } = require('../utils/response');

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, type, area, isHot } = req.query;
    let query = { status: 1 };
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } }
      ];
    }
    if (type) query.type = type;
    if (area) query.area = area;
    if (isHot !== undefined) query.isHot = isHot === 'true';
    
    const total = await Food.countDocuments(query);
    const foods = await Food.find(query).sort({ sortOrder: 1, createdAt: -1 }).skip((page - 1) * pageSize).limit(parseInt(pageSize));
    res.json(success(pagination(foods, total, parseInt(page), parseInt(pageSize))));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findOne({ id: req.params.id, status: 1 });
    if (!food) {
      return res.status(404).json(error('美食不存在'));
    }
    res.json(success(food));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// 封面图与轮播图第一张始终保持一致
const syncImages = (body) => {
  if (body.images && body.images.length > 0) {
    body.image = body.images[0];
  } else if (body.image) {
    body.images = [body.image];
  }
};



router.post('/', protect, async (req, res) => {
  syncImages(req.body);
  try {
    const food = await Food.create(req.body);
    res.json(success(food, '新增成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.put('/:id', protect, async (req, res) => {
  syncImages(req.body);
  try {
    const food = await Food.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!food) {
      return res.status(404).json(error('美食不存在'));
    }
    res.json(success(food, '更新成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const food = await Food.findOneAndDelete({ id: req.params.id });
    if (!food) {
      return res.status(404).json(error('美食不存在'));
    }
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

module.exports = router;