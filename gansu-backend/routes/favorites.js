const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Spot = require('../models/Spot');
const Culture = require('../models/Culture');
const Food = require('../models/Food');
const Product = require('../models/Product');
const { success, error } = require('../utils/response');

// GET /api/favorites/:deviceId — 获取收藏列表
router.get('/:deviceId', async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const favs = await Favorite.find({ deviceId }).sort({ createdAt: -1 }).lean();
    const itemIds = favs.map(f => f.itemId);

    if (itemIds.length === 0) {
      return res.json(success({ spots: [], cultures: [], foods: [], products: [] }));
    }

    // 按 ID 分组
    const cultureIds = itemIds.filter(id => parseInt(id) < 100);
    const spotIds    = itemIds.filter(id => parseInt(id) >= 100 && parseInt(id) < 200);
    const foodIds    = itemIds.filter(id => parseInt(id) >= 200 && parseInt(id) < 300);
    const productIds = itemIds.filter(id => parseInt(id) >= 300 && parseInt(id) < 400);

    const [spots, cultures, foods, products] = await Promise.all([
      Spot.find({ id: { $in: spotIds }, status: 1 }).select('id name image tags location rating level category').lean(),
      Culture.find({ id: { $in: cultureIds }, status: 1 }).select('id name image tags location rating level').lean(),
      Food.find({ id: { $in: foodIds }, status: 1 }).select('id name image tags location rating area').lean(),
      Product.find({ id: { $in: productIds }, status: 1 }).select('id name image price tags location rating stock isHot').lean()
    ]);

    res.json(success({ spots, cultures, foods, products }));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// POST /api/favorites/:deviceId/toggle — 切换收藏
router.post('/:deviceId/toggle', async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json(error('缺少 itemId'));

    const exists = await Favorite.findOne({ deviceId, itemId });
    if (exists) {
      await Favorite.deleteOne({ deviceId, itemId });
      res.json(success({ collected: false }));
    } else {
      await Favorite.create({ deviceId, itemId });
      res.json(success({ collected: true }));
    }
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// GET /api/favorites/:deviceId/check/:itemId — 检查是否收藏
router.get('/:deviceId/check/:itemId', async (req, res) => {
  try {
    const { deviceId, itemId } = req.params;
    const exists = await Favorite.findOne({ deviceId, itemId });
    res.json(success({ collected: !!exists }));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

module.exports = router;
