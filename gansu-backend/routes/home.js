const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const QuickEntry = require('../models/QuickEntry');
const Spot = require('../models/Spot');
const Culture = require('../models/Culture');
const Food = require('../models/Food');
const EventModel = require('../models/Event');
const { success, error } = require('../utils/response');

router.get('/', async (req, res) => {
  try {
    // 热门优先，不够时用普通数据补齐
    async function fillWithFallback(Model, filter, sort, targetCount) {
      const hot = await Model.find({ status: 1, ...filter }).sort(sort).limit(targetCount).lean();
      if (hot.length >= targetCount) return hot;
      const hotIds = new Set(hot.map(i => String(i.id || i._id)));
      const rest = await Model.find({ status: 1, $and: [{ $or: Object.keys(filter).map(k => ({ [k]: { $ne: true } })) }] })
        .sort(sort).limit(targetCount - hot.length).lean();
      return [...hot, ...rest];
    }

    const [
      banners, quickEntries,
      hotSpots, hotCultures, hotFoods,
      eventsWithFallback
    ] = await Promise.all([
      Banner.find({ status: 1 }).sort({ sortOrder: 1 }).limit(5).lean(),
      QuickEntry.find({ status: 1 }).sort({ sortOrder: 1 }).limit(8).lean(),
      fillWithFallback(Spot, { isHot: true }, { sortOrder: 1 }, 9),
      fillWithFallback(Culture, {}, { sortOrder: 1 }, 10),
      fillWithFallback(Food, { isHot: true }, { sortOrder: 1 }, 5),
      EventModel.find({ status: 1, date: { $gte: new Date() } }).sort({ date: 1 }).limit(5).lean(),
    ]);

    res.json(success({
      banners,
      quickEntries,
      hotSpots,
      hotCultures,
      hotFoods,
      events: eventsWithFallback,
      updateTime: new Date().toISOString()
    }));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

module.exports = router;