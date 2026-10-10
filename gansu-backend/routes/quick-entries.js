const express = require('express');
const router = express.Router();
const QuickEntry = require('../models/QuickEntry');
const { protect } = require('../middleware/auth');
const { success, error } = require('../utils/response');

router.get('/', async (req, res) => {
  try {
    const entries = await QuickEntry.find({ status: 1 })
      .sort({ sortOrder: 1 })
      .limit(8);
    res.json(success(entries));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const entry = await QuickEntry.create(req.body);
    res.json(success(entry, '新增成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const entry = await QuickEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!entry) {
      return res.status(404).json(error('快捷入口不存在'));
    }
    res.json(success(entry, '更新成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const entry = await QuickEntry.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json(error('快捷入口不存在'));
    }
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

module.exports = router;