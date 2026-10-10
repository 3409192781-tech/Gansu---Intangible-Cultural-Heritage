const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const Spot = require('../models/Spot');
const Culture = require('../models/Culture');
const Food = require('../models/Food');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Event = require('../models/Event');
const Banner = require('../models/Banner');
const User = require('../models/User');

// 仪表盘统计
router.get('/dashboard', protect, async (req, res) => {
  try {
    const [
      spotCount, cultureCount, foodCount, productCount,
      orderTotal, orderPending, orderRefunding, orderToday,
      eventCount, bannerCount, userCount
    ] = await Promise.all([
      Spot.countDocuments({ status: 1 }),
      Culture.countDocuments({ status: 1 }),
      Food.countDocuments({ status: 1 }),
      Product.countDocuments({ status: 1 }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'refunding' }),
      (() => { const d = new Date(); d.setHours(0,0,0,0); return Order.countDocuments({ createdAt: { $gte: d } }); })(),
      Event.countDocuments({ status: 1 }),
      Banner.countDocuments({ status: 1 }),
      User.countDocuments()
    ]);

    res.json(success({
      spotCount,
      cultureCount,
      foodCount,
      productCount,
      orderTotal,
      orderPending,
      orderRefunding,
      orderToday,
      eventCount,
      bannerCount,
      userCount
    }));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// 验证 token 有效性
router.get('/auth/check', protect, (req, res) => {
  res.json(success({ valid: true, user: req.user }));
});

// 用户列表
router.get('/users', protect, async (req, res) => {
  try {
    const { page = 1, pageSize = 50, keyword } = req.query;
    const filter = {};
    if (keyword) {
      filter.$or = [
        { nickName: { $regex: keyword, $options: 'i' } },
        { openid: { $regex: keyword, $options: 'i' } }
      ];
    }
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));
    res.json(success({ list: users, total, page: parseInt(page), pageSize: parseInt(pageSize) }));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

module.exports = router;
