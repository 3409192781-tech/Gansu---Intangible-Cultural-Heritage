const express = require('express');
const router = express.Router();
const Culture = require('../models/Culture');
const Spot = require('../models/Spot');
const Food = require('../models/Food');
const { success, error } = require('../utils/response');

router.get('/', async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || !keyword.trim()) {
      return res.json(success({ cultures: [], spots: [], foods: [] }));
    }

    const kw = keyword.trim();
    const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const searchQuery = (field) => {
      return [
        { [field]: regex },
        { tags: regex },
        { location: regex }
      ];
    };

    const [cultures, spots, foods] = await Promise.all([
      Culture.find({ status: 1, $or: searchQuery('name') })
        .select('id name image tags location rating reviews level')
        .limit(20),
      Spot.find({ status: 1, $or: searchQuery('name') })
        .select('id name image tags location rating reviews')
        .limit(20),
      Food.find({ status: 1, $or: searchQuery('name') })
        .select('id name image tags location rating reviews')
        .limit(20)
    ]);

    res.json(success({ cultures, spots, foods }));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

module.exports = router;
