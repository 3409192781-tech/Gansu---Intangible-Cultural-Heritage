const express = require('express');
const router = express.Router();
const EventModel = require('../models/Event');
const { protect } = require('../middleware/auth');
const { success, error } = require('../utils/response');

router.get('/', async (req, res) => {
  try {
    const { limit, admin, page = 1, pageSize = 200 } = req.query;
    const now = new Date();

    var query = { status: 1 };
    // admin 模式显示所有活动（含已过期），默认只显示即将到来
    if (!admin) {
      query.date = { $gte: now };
    }

    var total = await EventModel.countDocuments(query);
    var events = await EventModel.find(query)
      .sort({ date: 1 })
      .skip((parseInt(page, 10) - 1) * parseInt(pageSize, 10))
      .limit(parseInt(limit || pageSize, 10));

    res.json(success({ list: events, total: total, page: parseInt(page, 10), pageSize: parseInt(pageSize, 10) }));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.id);

    if (!event) {
      return res.status(404).json(error('活动不存在'));
    }

    res.json(success(event));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const event = await EventModel.create(req.body);
    res.json(success(event, '新增成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const event = await EventModel.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!event) {
      return res.status(404).json(error('活动不存在'));
    }

    res.json(success(event, '更新成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await EventModel.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json(error('活动不存在'));
    }

    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

module.exports = router;