const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { success, error, pagination } = require('../utils/response');

// GET /api/products/categories - 分类统计（必须在 /:id 之前）
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { status: 1 } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json(success(categories));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// GET /api/products/hot - 热销产品（必须在 /:id 之前）
router.get('/hot', async (req, res) => {
  try {
    const products = await Product.find({ status: 1, isHot: true })
      .sort({ sortOrder: 1 })
      .limit(6);
    res.json(success(products));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// GET /api/products - 分页列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, category, isHot, isNew, status, admin } = req.query;

    let query = {};
    // admin 模式显示所有产品（含已下架），否则默认只显示在售
    if (!admin) {
      query.status = 1;
    } else if (status !== undefined) {
      query.status = parseInt(status, 10);
    }

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (isHot !== undefined) {
      query.isHot = isHot === 'true';
    }

    if (isNew !== undefined) {
      query.isNew = isNew === 'true';
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    res.json(success(pagination(products, total, parseInt(page), parseInt(pageSize))));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// GET /api/products/:id - 产品详情
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id, status: 1 });

    if (!product) {
      return res.status(404).json(error('文创产品不存在'));
    }

    res.json(success(product));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// POST /api/products - 新增产品（管理员）
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
    const product = await Product.create(req.body);
    res.json(success(product, '新增成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// PUT /api/products/:id - 更新产品（管理员）
router.put('/:id', protect, async (req, res) => {
  syncImages(req.body);
  try {
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json(error('文创产品不存在'));
    }

    res.json(success(product, '更新成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// DELETE /api/products/:id - 删除产品（管理员）
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });

    if (!product) {
      return res.status(404).json(error('文创产品不存在'));
    }

    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

module.exports = router;
