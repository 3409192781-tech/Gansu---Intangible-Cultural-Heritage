const express = require('express');
const router = express.Router();
const Spot = require('../models/Spot');
const Culture = require('../models/Culture');
const { protect } = require('../middleware/auth');
const { success, error, pagination } = require('../utils/response');

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, level, category, isHot } = req.query;

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

    if (category) {
      query.category = category;
    }

    if (isHot !== undefined) {
      query.isHot = isHot === 'true';
    }

    const total = await Spot.countDocuments(query);
    const spots = await Spot.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    res.json(success(pagination(spots, total, parseInt(page), parseInt(pageSize))));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const spot = await Spot.findOne({ id: req.params.id, status: 1 });

    if (!spot) {
      // 兜底：小程序城市详情页把非遗项误跳 type=spot，
      // 非遗 id（1-50）不在景点集合，改为查非遗集合返回，避免详情空白
      const culture = await Culture.findOne({ id: req.params.id, status: 1 });
      if (culture) {
        return res.json(success(culture));
      }
      return res.status(404).json(error('景点不存在'));
    }

    if (spot.heritages && spot.heritages.length > 0) {
      const heritages = await Culture.find({
        id: { $in: spot.heritages },
        status: 1
      });
      spot._doc.heritages = heritages;
    }

    res.json(success(spot));
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
    const spot = await Spot.create(req.body);
    res.json(success(spot, '新增成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.put('/:id', protect, async (req, res) => {
  syncImages(req.body);
  try {
    const spot = await Spot.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );

    if (!spot) {
      return res.status(404).json(error('景点不存在'));
    }

    res.json(success(spot, '更新成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const spot = await Spot.findOneAndDelete({ id: req.params.id });

    if (!spot) {
      return res.status(404).json(error('景点不存在'));
    }

    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

module.exports = router;