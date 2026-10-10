const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect } = require('../middleware/auth');
const { success, error } = require('../utils/response');

// GET /api/settings — 公开，返回所有站点设置（key-value 映射）
router.get('/', async (req, res) => {
  try {
    const rows = await Setting.find().lean();
    const map = {};
    rows.forEach(r => { map[r.key] = r.value; });
    res.json(success(map));
  } catch (err) {
    res.status(500).json(error('操作失败'));
  }
});

// POST /api/settings — 管理员，批量保存设置
router.post('/', protect, async (req, res) => {
  try {
    const settings = req.body; // { heroImage: '...', heroTitle: '...', ... }
    const ops = Object.entries(settings).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value } },
        upsert: true
      }
    }));
    if (ops.length > 0) {
      await Setting.bulkWrite(ops);
    }
    res.json(success(null, '设置已保存'));
  } catch (err) {
    res.status(500).json(error('保存失败'));
  }
});

module.exports = router;
