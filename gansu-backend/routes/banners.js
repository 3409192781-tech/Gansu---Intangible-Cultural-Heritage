const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { protect } = require('../middleware/auth');
const { success, error } = require('../utils/response');

router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ status: 1 })
      .sort({ sortOrder: 1 })
      .limit(5);

    res.json(success(banners));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.json(success(banner, '新增成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!banner) {
      return res.status(404).json(error('Banner不存在'));
    }

    res.json(success(banner, '更新成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json(error('Banner不存在'));
    }

    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

module.exports = router;