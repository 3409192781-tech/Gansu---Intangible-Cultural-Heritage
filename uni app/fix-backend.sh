#!/bin/bash
echo "=== 修复后端路由 ==="

cd /home/ubuntu

cat > server/routes/spots.js << 'ROUTESEOF'
const express = require('express');
const router = express.Router();
const Spot = require('../models/Spot');
const { success, error, pagination } = require('../utils/response');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    
    const total = await Spot.countDocuments({ status: 1 });
    const spots = await Spot.find({ status: 1 })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    
    res.json(success(pagination(spots, total, page, pageSize)));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    let spot = await Spot.findById(req.params.id);
    if (!spot) {
      spot = await Spot.findOne({ id: req.params.id });
    }
    if (!spot) return res.status(404).json(error('景点不存在'));
    res.json(success(spot));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const spot = await Spot.create(req.body);
    res.json(success(spot, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    let spot = await Spot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!spot) {
      spot = await Spot.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    }
    if (!spot) return res.status(404).json(error('景点不存在'));
    res.json(success(spot, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    let spot = await Spot.findByIdAndDelete(req.params.id);
    if (!spot) {
      spot = await Spot.findOneAndDelete({ id: req.params.id });
    }
    if (!spot) return res.status(404).json(error('景点不存在'));
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
ROUTESEOF

cat > server/routes/cultures.js << 'ROUTESEOF'
const express = require('express');
const router = express.Router();
const Culture = require('../models/Culture');
const { success, error, pagination } = require('../utils/response');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    
    const total = await Culture.countDocuments({ status: 1 });
    const cultures = await Culture.find({ status: 1 })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    
    res.json(success(pagination(cultures, total, page, pageSize)));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    let culture = await Culture.findById(req.params.id);
    if (!culture) {
      culture = await Culture.findOne({ id: req.params.id });
    }
    if (!culture) return res.status(404).json(error('非遗不存在'));
    res.json(success(culture));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const culture = await Culture.create(req.body);
    res.json(success(culture, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    let culture = await Culture.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!culture) {
      culture = await Culture.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    }
    if (!culture) return res.status(404).json(error('非遗不存在'));
    res.json(success(culture, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    let culture = await Culture.findByIdAndDelete(req.params.id);
    if (!culture) {
      culture = await Culture.findOneAndDelete({ id: req.params.id });
    }
    if (!culture) return res.status(404).json(error('非遗不存在'));
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
ROUTESEOF

cat > server/routes/foods.js << 'ROUTESEOF'
const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const { success, error, pagination } = require('../utils/response');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    
    const total = await Food.countDocuments({ status: 1 });
    const foods = await Food.find({ status: 1 })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    
    res.json(success(pagination(foods, total, page, pageSize)));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    let food = await Food.findById(req.params.id);
    if (!food) {
      food = await Food.findOne({ id: req.params.id });
    }
    if (!food) return res.status(404).json(error('美食不存在'));
    res.json(success(food));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.json(success(food, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    let food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!food) {
      food = await Food.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    }
    if (!food) return res.status(404).json(error('美食不存在'));
    res.json(success(food, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    let food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      food = await Food.findOneAndDelete({ id: req.params.id });
    }
    if (!food) return res.status(404).json(error('美食不存在'));
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
ROUTESEOF

echo "路由文件更新完成"

echo ""
echo "重启服务..."
pm2 restart gansu-backend
pm2 status

echo ""
echo "测试 API..."
curl http://localhost:3000/api/spots/101
echo ""
curl http://localhost:3000/api/cultures/1
echo ""
curl http://localhost:3000/api/foods/201

echo ""
echo "=== 修复完成 ==="
