const express = require('express');
const router = express.Router();
const Culture = require('../models/Culture');
const { protect } = require('../middleware/auth');
const { success, error, pagination } = require('../utils/response');

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, level, type } = req.query;

    let query = { status: 1 };

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (level) {
      query.level = level;
    }

    if (type) {
      query.type = type;
    }

    const total = await Culture.countDocuments(query);
    const cultures = await Culture.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    res.json(success(pagination(cultures, total, parseInt(page), parseInt(pageSize))));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const culture = await Culture.findOne({ id: req.params.id, status: 1 });

    if (!culture) {
      return res.status(404).json(error('非遗项目不存在'));
    }

    res.json(success(culture));
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
    const culture = await Culture.create(req.body);
    res.json(success(culture, '新增成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.put('/:id', protect, async (req, res) => {
  syncImages(req.body);
  try {
    const culture = await Culture.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );

    if (!culture) {
      return res.status(404).json(error('非遗项目不存在'));
    }

    res.json(success(culture, '更新成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const culture = await Culture.findOneAndDelete({ id: req.params.id });

    if (!culture) {
      return res.status(404).json(error('非遗项目不存在'));
    }

    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

module.exports = router;