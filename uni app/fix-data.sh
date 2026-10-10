cat > fix-data.sh << 'ENDOFFILE'

#!/bin/bash

cd /home/ubuntu

echo "=== 修复后端路由 ==="

cat > routes/spots.js << 'ROUTESEOF'
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
    const spots = await Spot.find({ status: 1 }).skip(skip).limit(pageSize).sort({ createdAt: -1 });
    res.json(success(pagination(spots, total, page, pageSize)));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    let spot = await Spot.findById(req.params.id);
    if (!spot) spot = await Spot.findOne({ id: req.params.id });
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
    if (!spot) spot = await Spot.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!spot) return res.status(404).json(error('景点不存在'));
    res.json(success(spot, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    let spot = await Spot.findByIdAndDelete(req.params.id);
    if (!spot) spot = await Spot.findOneAndDelete({ id: req.params.id });
    if (!spot) return res.status(404).json(error('景点不存在'));
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
ROUTESEOF

cat > routes/cultures.js << 'ROUTESEOF'
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
    const cultures = await Culture.find({ status: 1 }).skip(skip).limit(pageSize).sort({ createdAt: -1 });
    res.json(success(pagination(cultures, total, page, pageSize)));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    let culture = await Culture.findById(req.params.id);
    if (!culture) culture = await Culture.findOne({ id: req.params.id });
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
    if (!culture) culture = await Culture.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!culture) return res.status(404).json(error('非遗不存在'));
    res.json(success(culture, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    let culture = await Culture.findByIdAndDelete(req.params.id);
    if (!culture) culture = await Culture.findOneAndDelete({ id: req.params.id });
    if (!culture) return res.status(404).json(error('非遗不存在'));
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
ROUTESEOF

cat > routes/foods.js << 'ROUTESEOF'
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
    const foods = await Food.find({ status: 1 }).skip(skip).limit(pageSize).sort({ createdAt: -1 });
    res.json(success(pagination(foods, total, page, pageSize)));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    let food = await Food.findById(req.params.id);
    if (!food) food = await Food.findOne({ id: req.params.id });
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
    if (!food) food = await Food.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!food) return res.status(404).json(error('美食不存在'));
    res.json(success(food, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    let food = await Food.findByIdAndDelete(req.params.id);
    if (!food) food = await Food.findOneAndDelete({ id: req.params.id });
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
echo "=== 修复数据 ==="

cat > fixInitData.js << 'EOF'
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gansu-culture');

const Spot = require('./models/Spot');
const Culture = require('./models/Culture');
const Food = require('./models/Food');
const Banner = require('./models/Banner');

const qiniuDomain = 'https://images.unsplash.com';

const initData = async () => {
  try {
    await Spot.deleteMany({});
    await Culture.deleteMany({});
    await Food.deleteMany({});
    await Banner.deleteMany({});

    await Banner.create([
      { image: `${qiniuDomain}/spots/spot101-1.jpg`, title: '莫高窟', desc: '世界文化遗产 · 千年艺术瑰宝', linkType: 'detail', linkValue: '101', sortOrder: 1, status: 1 },
      { image: `${qiniuDomain}/spots/spot103-1.jpg`, title: '麦积山石窟', desc: '东方雕塑艺术陈列馆', linkType: 'detail', linkValue: '103', sortOrder: 2, status: 1 },
      { image: `${qiniuDomain}/spots/spot104-1.jpg`, title: '嘉峪关关城', desc: '天下第一雄关 · 万里长城', linkType: 'detail', linkValue: '104', sortOrder: 3, status: 1 }
    ]);
    console.log('轮播图数据更新完成');

    await Spot.create([
      {
        id: '101', name: '莫高窟', type: 'spot', rating: '4.9', reviews: '12580',
        tags: ['世界文化遗产', 'AAAAA级景区'], location: '敦煌市', area: '敦煌',
        image: `${qiniuDomain}/spots/spot101-1.jpg`, isHot: true, sortOrder: 1, status: 1,
        description: '莫高窟俗称千佛洞，位于敦煌市东南25公里处的鸣沙山东麓崖壁上，始建于十六国时期，历经十六国、北朝、隋、唐、五代、西夏、元等历代的兴建，形成巨大的规模，有洞窟735个，壁画4.5万平方米、泥质彩塑2415尊，是世界上现存规模最大、内容最丰富的佛教艺术地。',
        openTime: '08:00 - 18:00',
        ticketInfo: '全价票：238元/人\n优惠票：119元/人',
        transport: '公交：敦煌市区乘12路公交到莫高窟数字展示中心\n自驾：距市区约25公里，车程约30分钟',
        tips: ['建议提前网上预约', '需要观看数字电影', '洞窟内禁止拍照', '夏季注意防晒'],
        images: [
          `${qiniuDomain}/spots/spot101-1.jpg`,
          `${qiniuDomain}/spots/spot101-2.jpg`,
          `${qiniuDomain}/spots/spot101-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/spot101.mp4`,
        heritages: [{ id: '1', name: '敦煌壁画', level: '世界级非遗' }, { id: '3', name: '敦煌彩塑', level: '国家级非遗' }]
      },
      {
        id: '102', name: '鸣沙山月牙泉', type: 'spot', rating: '4.8', reviews: '9870',
        tags: ['AAAAA级景区', '沙漠奇观', '自然景观'], location: '敦煌市', area: '敦煌',
        image: `${qiniuDomain}/spots/spot102-1.jpg`, isHot: true, sortOrder: 2, status: 1,
        description: '鸣沙山月牙泉位于敦煌城南5公里处，是国家级重点风景名胜区。鸣沙山以沙动成响而得名，月牙泉因形似一弯新月而得名，被誉为"塞外风光之一绝"。沙泉共生，泉沙共存的独特地貌，确为"天下奇观"。',
        openTime: '06:00 - 20:00 (旺季)\n07:00 - 19:00 (淡季)',
        ticketInfo: '全价票：110元/人\n优惠票：55元/人',
        transport: '公交：敦煌市区乘3路公交直达\n自驾：距市区约5公里，车程约15分钟',
        tips: ['建议早晚游玩', '可以骑骆驼', '注意防晒防风沙', '景区门口有鞋套卖'],
        images: [
          `${qiniuDomain}/spots/spot102-1.jpg`,
          `${qiniuDomain}/spots/spot102-2.jpg`,
          `${qiniuDomain}/spots/spot102-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/spot102.mp4`,
        heritages: [{ id: '1', name: '敦煌壁画', level: '世界级非遗' }]
      },
      {
        id: '103', name: '麦积山石窟', type: 'spot', rating: '4.7', reviews: '8650',
        tags: ['世界文化遗产', 'AAAAA级景区', '雕塑艺术'], location: '天水市', area: '天水',
        image: `${qiniuDomain}/spots/spot103-1.jpg`, isHot: true, sortOrder: 3, status: 1,
        description: '麦积山石窟位于甘肃省天水市麦积区，是中国四大石窟之一。麦积山石窟始建于384-417年，存有221座洞窟、10632身泥塑石雕、1300余平方米壁画，以其精美的泥塑艺术闻名世界，被誉为东方雕塑艺术陈列馆。',
        openTime: '08:00 - 17:30',
        ticketInfo: '全价票：90元/人\n优惠票：45元/人',
        transport: '公交：天水市区乘5路公交到麦积山站\n自驾：距市区约30公里，车程约40分钟',
        tips: ['建议请讲解员', '山路较陡注意安全', '洞窟内禁止拍照', '夏季注意防暑'],
        images: [
          `${qiniuDomain}/spots/spot103-1.jpg`,
          `${qiniuDomain}/spots/spot103-2.jpg`,
          `${qiniuDomain}/spots/spot103-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/spot103.mp4`,
        heritages: [{ id: '4', name: '天水雕漆技艺', level: '国家级非遗' }]
      },
      {
        id: '104', name: '嘉峪关关城', type: 'spot', rating: '4.6', reviews: '7430',
        tags: ['AAAAA级景区', '万里长城', '历史古迹'], location: '嘉峪关市', area: '嘉峪关',
        image: `${qiniuDomain}/spots/spot104-1.jpg`, isHot: true, sortOrder: 4, status: 1,
        description: '嘉峪关关城位于嘉峪关市西5公里处最狭窄的山谷中部，城关两侧的城墙横穿沙漠戈壁，北连黑山悬壁长城，南接天下第一墩，是明代万里长城最西端的关口，历史上曾被称为河西咽喉，因地势险要，建筑雄伟，有天下第一雄关、连陲锁钥之称。',
        openTime: '08:30 - 18:00',
        ticketInfo: '全价票：110元/人\n优惠票：55元/人',
        transport: '公交：嘉峪关市区乘4路公交到关城景区\n自驾：距市区约5公里，车程约15分钟',
        tips: ['建议请讲解员', '可以参观长城第一墩', '城墙很高注意安全', '夏季注意防晒'],
        images: [
          `${qiniuDomain}/spots/spot104-1.jpg`,
          `${qiniuDomain}/spots/spot104-2.jpg`,
          `${qiniuDomain}/spots/spot104-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/spot104.mp4`,
        heritages: [{ id: '5', name: '嘉峪关传说', level: '省级非遗' }]
      },
      {
        id: '105', name: '张掖丹霞', type: 'spot', rating: '4.8', reviews: '11230',
        tags: ['AAAAA级景区', '世界地质公园', '自然奇观'], location: '张掖市', area: '张掖',
        image: `${qiniuDomain}/spots/spot105-1.jpg`, isHot: true, sortOrder: 5, status: 1,
        description: '张掖七彩丹霞地貌群位于甘肃省张掖市临泽县倪家营乡南台村，平均海拔1850米，东西长约45公里，南北宽约10公里。该地貌群以其面积大、集中，层理交错、岩壁陡峭、气势磅礴、造型奇特、色彩斑斓而称奇。',
        openTime: '06:00 - 18:00',
        ticketInfo: '全价票：74元/人\n优惠票：37元/人',
        transport: '建议自驾，距张掖市区约40公里\n可参加一日游旅行团',
        tips: ['日落时分最美', '景区内有观光车', '不要进入未开放区域', '夏季注意防晒'],
        images: [
          `${qiniuDomain}/spots/spot105-1.jpg`,
          `${qiniuDomain}/spots/spot105-2.jpg`,
          `${qiniuDomain}/spots/spot105-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/spot105.mp4`,
        heritages: [{ id: '8', name: '裕固族民歌', level: '国家级非遗' }]
      }
    ]);
    console.log('景点数据更新完成');

    await Culture.create([
      {
        id: '1', name: '敦煌壁画', level: '世界级', rating: '4.9', reviews: '15680',
        tags: ['世界级非遗', '传统美术', '敦煌特色'], location: '敦煌市',
        image: `${qiniuDomain}/details/detail1-1.jpg`, sortOrder: 1, status: 1,
        description: '敦煌壁画是敦煌石窟艺术的重要组成部分，包括敦煌莫高窟、西千佛洞、安西榆林窟等522个石窟的历代壁画，总面积约5万平方米。壁画内容丰富，题材广泛，包括佛像画、经变画、民族传统神话题材、供养人画像、装饰图案画等。',
        openTime: '08:00 - 18:00',
        ticketInfo: '包含在莫高窟门票内',
        transport: '同莫高窟',
        tips: ['建议请讲解员', '洞窟内禁止拍照', '可以购买壁画画册', '注意保护文物'],
        images: [
          `${qiniuDomain}/details/detail1-1.jpg`,
          `${qiniuDomain}/details/detail1-2.jpg`,
          `${qiniuDomain}/details/detail1-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/detail1.mp4`
      },
      {
        id: '2', name: '花儿', level: '世界级', rating: '4.8', reviews: '8920',
        tags: ['世界级非遗', '传统音乐', '临夏特色'], location: '临夏市',
        image: `${qiniuDomain}/details/detail2-1.jpg`, sortOrder: 2, status: 1,
        description: '花儿是流行于甘肃、青海、宁夏等广大地区的一种山歌，是当地人民口头文学形式之一。花儿结构分两段，前段比兴、后段是歌唱的主题内容。曲调具有浓郁的乡土气息和民族风格，深受当地群众的喜爱。',
        openTime: '节日期间集中演唱\n具体时间请关注通知',
        ticketInfo: '免费聆听',
        transport: '在临夏各大花儿会场聆听',
        tips: ['花儿会期间最热闹', '可以参与对歌', '感受西北风情', '注意防晒'],
        images: [
          `${qiniuDomain}/details/detail2-1.jpg`,
          `${qiniuDomain}/details/detail2-2.jpg`,
          `${qiniuDomain}/details/detail2-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/detail2.mp4`
      },
      {
        id: '3', name: '敦煌彩塑', level: '国家级', rating: '4.9', reviews: '12350',
        tags: ['国家级非遗', '传统美术', '敦煌特色'], location: '敦煌市',
        image: `${qiniuDomain}/details/detail3-1.jpg`, sortOrder: 3, status: 1,
        description: '敦煌彩塑是敦煌石窟艺术的重要组成部分，现存彩塑2415尊，包括佛像、菩萨像、弟子像、天王像、力士像等。彩塑艺术风格独特，从早期的西域风格到唐代的中原风格，再到宋代的写实风格，展现了不同历史时期的艺术特色。',
        openTime: '08:00 - 18:00',
        ticketInfo: '包含在莫高窟门票内',
        transport: '同莫高窟',
        tips: ['建议请讲解员', '洞窟内禁止拍照', '可以购买彩塑画册', '注意保护文物'],
        images: [
          `${qiniuDomain}/details/detail3-1.jpg`,
          `${qiniuDomain}/details/detail3-2.jpg`,
          `${qiniuDomain}/details/detail3-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/detail3.mp4`
      },
      {
        id: '4', name: '兰州太平鼓', level: '国家级', rating: '4.7', reviews: '6780',
        tags: ['国家级非遗', '传统舞蹈', '兰州特色'], location: '兰州市',
        image: `${qiniuDomain}/details/detail4-1.jpg`, sortOrder: 4, status: 1,
        description: '兰州太平鼓是一种具有600多年历史的传统鼓舞。太平鼓作为兰州地区独特的民间艺术，每逢大的庆典活动，太平鼓表演都是整个活动的高潮部分，那铿锵有力的鼓声，显示了黄河之滨人民的英雄气魄。',
        openTime: '春节、元宵节期间\n具体时间请关注通知',
        ticketInfo: '免费观看',
        transport: '在兰州市区各广场观看',
        tips: ['场面很壮观', '可以拍照', '冬季观看注意保暖', '感受传统文化'],
        images: [
          `${qiniuDomain}/details/detail4-1.jpg`,
          `${qiniuDomain}/details/detail4-2.jpg`,
          `${qiniuDomain}/details/detail4-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/detail4.mp4`
      },
      {
        id: '5', name: '陇剧', level: '国家级', rating: '4.6', reviews: '4520',
        tags: ['国家级非遗', '传统戏剧', '甘肃特色'], location: '兰州市',
        image: `${qiniuDomain}/details/detail5-1.jpg`, sortOrder: 5, status: 1,
        description: '陇剧是甘肃特有的地方戏曲剧种，起源于甘肃东部的皮影戏，形成于20世纪50年代。陇剧音乐优美，唱腔独特，表演细腻，具有浓郁的西北地方特色。',
        openTime: '周末及节假日演出\n具体时间请关注通知',
        ticketInfo: '演出票：30-60元/人',
        transport: '在甘肃大剧院观看',
        tips: ['提前购票', '可以拍照', '感受西北戏曲魅力', '适合带老人观看'],
        images: [
          `${qiniuDomain}/details/detail5-1.jpg`,
          `${qiniuDomain}/details/detail5-2.jpg`,
          `${qiniuDomain}/details/detail5-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/detail5.mp4`
      },
      {
        id: '6', name: '藏族唐卡', level: '国家级', rating: '4.8', reviews: '7890',
        tags: ['国家级非遗', '传统美术', '甘南特色'], location: '甘南州',
        image: `${qiniuDomain}/details/detail6-1.jpg`, sortOrder: 6, status: 1,
        description: '藏族唐卡是藏族文化中一种独特的绘画艺术形式，具有鲜明的民族特点、浓郁的宗教色彩和独特的艺术风格。唐卡内容丰富，包括佛像、佛教故事、藏族风情等，是藏族文化的重要载体。',
        openTime: '09:00 - 17:30',
        ticketInfo: '展览馆：40元/人\n体验绘画：168元/人',
        transport: '在甘南各大唐卡艺术中心参观',
        tips: ['可以参观绘画过程', '建议购买精品唐卡', '注意辨别真伪', '适合作为收藏礼品'],
        images: [
          `${qiniuDomain}/details/detail6-1.jpg`,
          `${qiniuDomain}/details/detail6-2.jpg`,
          `${qiniuDomain}/details/detail6-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/detail6.mp4`
      }
    ]);
    console.log('非遗文化数据更新完成');

    await Food.create([
      {
        id: '201', name: '兰州牛肉面', type: 'food', rating: '4.9', reviews: '35680',
        tags: ['百年传承', '中华名小吃'], location: '兰州市', area: '兰州',
        image: `${qiniuDomain}/foods/food201-1.jpg`, isHot: true, sortOrder: 1, status: 1,
        description: '兰州牛肉面，又称兰州清汤牛肉面，是甘肃省兰州市的一种风味美食，以"汤镜者清，肉烂者香，面细者精"的独特风味和"一清二白三红四绿五黄"的色泽搭配赢得了国内乃至全世界顾客的好评。',
        openTime: '06:00 - 22:00',
        ticketInfo: '品尝：8-15元/碗',
        transport: '在兰州市区各大街巷品尝',
        tips: ['一定要吃现拉的', '可以选择面的粗细', '加肉更美味', '配蒜吃更香'],
        images: [
          `${qiniuDomain}/foods/food201-1.jpg`,
          `${qiniuDomain}/foods/food201-2.jpg`,
          `${qiniuDomain}/foods/food201-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/food201.mp4`
      },
      {
        id: '202', name: '手抓羊肉', type: 'food', rating: '4.8', reviews: '18920',
        tags: ['东乡特产', '肉质鲜嫩'], location: '临夏州', area: '临夏',
        image: `${qiniuDomain}/foods/food202-1.jpg`, isHot: true, sortOrder: 2, status: 1,
        description: '手抓羊肉是西北各民族喜爱的传统名吃。其特点是肉味鲜美，不膻不腻，营养丰富。制作时选用膘肥肉嫩的羊，宰杀后去毛去内脏，整只下锅煮，煮好后捞出，切成大块，用手抓着吃。',
        openTime: '10:00 - 21:00',
        ticketInfo: '品尝：按重量计价\n约80-120元/斤',
        transport: '在临夏市区各大餐馆品尝',
        tips: ['东乡羊肉最正宗', '配蒜吃更香', '可以打包带走', '肉质很嫩'],
        images: [
          `${qiniuDomain}/foods/food202-1.jpg`,
          `${qiniuDomain}/foods/food202-2.jpg`,
          `${qiniuDomain}/foods/food202-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/food202.mp4`
      },
      {
        id: '203', name: '敦煌驴肉黄面', type: 'food', rating: '4.7', reviews: '12350',
        tags: ['敦煌特色', '筋道爽滑'], location: '敦煌市', area: '敦煌',
        image: `${qiniuDomain}/foods/food203-1.jpg`, isHot: true, sortOrder: 3, status: 1,
        description: '敦煌驴肉黄面是敦煌市的传统特色美食，以驴肉和黄面为原料，制作精细，味道鲜美。驴肉鲜嫩，黄面筋道爽滑，是敦煌最具代表性的特色美食之一。',
        openTime: '10:00 - 21:00',
        ticketInfo: '品尝：30-50元/份',
        transport: '在敦煌市区各大餐馆品尝',
        tips: ['驴肉很嫩', '黄面筋道', '分量很足', '配凉菜更佳'],
        images: [
          `${qiniuDomain}/foods/food203-1.jpg`,
          `${qiniuDomain}/foods/food203-2.jpg`,
          `${qiniuDomain}/foods/food203-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/food203.mp4`
      },
      {
        id: '204', name: '张掖臊面', type: 'food', rating: '4.6', reviews: '8760',
        tags: ['张掖名吃', '汤鲜味美'], location: '张掖市', area: '张掖',
        image: `${qiniuDomain}/foods/food204-1.jpg`, isHot: true, sortOrder: 4, status: 1,
        description: '张掖臊面是张掖市的传统特色面食，以臊汤和面为原料，制作精细，味道鲜美。臊汤浓郁，面条筋道，是张掖最具代表性的特色面食之一。',
        openTime: '07:00 - 20:00',
        ticketInfo: '品尝：10-15元/碗',
        transport: '在张掖市区各大面馆品尝',
        tips: ['汤很浓郁', '可以加肉', '分量很足', '早餐吃最爽'],
        images: [
          `${qiniuDomain}/foods/food204-1.jpg`,
          `${qiniuDomain}/foods/food204-2.jpg`,
          `${qiniuDomain}/foods/food204-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/food204.mp4`
      },
      {
        id: '205', name: '天水呱呱', type: 'food', rating: '4.7', reviews: '11230',
        tags: ['天水特色', '香辣可口'], location: '天水市', area: '天水',
        image: `${qiniuDomain}/foods/food205-1.jpg`, isHot: true, sortOrder: 5, status: 1,
        description: '天水呱呱是天水市的传统特色小吃，以荞麦为原料，经过浸泡、磨浆、蒸煮等工序制成。呱呱口感软糯，味道香辣，是天水最具代表性的特色小吃之一。',
        openTime: '06:00 - 14:00',
        ticketInfo: '品尝：5-10元/碗',
        transport: '在天水市区各大小吃店品尝',
        tips: ['早上吃最正宗', '加辣子更香', '配面皮更佳', '很有特色'],
        images: [
          `${qiniuDomain}/foods/food205-1.jpg`,
          `${qiniuDomain}/foods/food205-2.jpg`,
          `${qiniuDomain}/foods/food205-3.jpg`
        ],
        videoUrl: `${qiniuDomain}/videos/food205.mp4`
      }
    ]);
    console.log('美食数据更新完成');

    console.log('');
    console.log('=== 所有数据修复完成 ===');
    process.exit(0);
  } catch (error) {
    console.error('数据修复失败:', error);
    process.exit(1);
  }
};

initData();
EOF

echo "修复脚本已创建"
echo ""
echo "执行数据修复..."
node fixInitData.js

echo ""
echo "重启服务..."
pm2 restart gansu-backend

echo ""
echo "验证数据..."
curl http://localhost:3000/api/spots/101
echo ""
echo ""
curl http://localhost:3000/api/cultures/1
echo ""
echo ""
curl http://localhost:3000/api/foods/201

echo ""
echo "=== 修复完成 ==="

ENDOFFILE