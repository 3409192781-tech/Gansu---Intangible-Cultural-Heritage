const express = require('express');
const router = express.Router();
const City = require('../models/City');
const Spot = require('../models/Spot');
const { protect } = require('../middleware/auth');
const { success, error } = require('../utils/response');

router.get('/', async (req, res) => {
  try {
    const cities = await City.find({ status: 1 }).sort({ name: 1 });
    res.json(success(cities));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.get('/:name', async (req, res) => {
  try {
    const city = await City.findOne({ name: req.params.name, status: 1 });
    if (!city) {
      return res.status(404).json(error('城市不存在'));
    }
    // 解析spots ID并加载景点详情
    const cityData = city.toObject();
    if (cityData.spots && cityData.spots.length > 0) {
      cityData.spots = await Spot.find({ id: { $in: cityData.spots }, status: 1 })
        .select('id name image tags location rating reviews')
        .lean();
    }
    res.json(success(cityData));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const city = await City.create(req.body);
    res.json(success(city, '新增成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.put('/:name', protect, async (req, res) => {
  try {
    const city = await City.findOneAndUpdate({ name: req.params.name }, req.body, { new: true });
    if (!city) {
      return res.status(404).json(error('城市不存在'));
    }
    res.json(success(city, '更新成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.delete('/:name', protect, async (req, res) => {
  try {
    const city = await City.findOneAndDelete({ name: req.params.name });
    if (!city) {
      return res.status(404).json(error('城市不存在'));
    }
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

module.exports = router;