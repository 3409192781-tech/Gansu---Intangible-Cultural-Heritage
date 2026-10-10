// 批量修复 MongoDB 中的媒体 URL — 从 Unsplash 占位图替换为七牛云真实地址
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const BASE = 'https://img.gansu-culture.xyz';

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('已连接 MongoDB');

  const Culture = require('../models/Culture');
  const Spot = require('../models/Spot');
  const Food = require('../models/Food');
  const City = require('../models/City');
  const Banner = require('../models/Banner');

  // ========== 非遗 ==========
  const cultures = await Culture.find({});
  for (const c of cultures) {
    const id = c.id;
    c.image = BASE + '/details/detail' + id + '-1.jpg';
    c.images = [
      BASE + '/details/detail' + id + '-1.jpg',
      BASE + '/details/detail' + id + '-2.jpg',
      BASE + '/details/detail' + id + '-3.jpg'
    ];
    c.videoUrl = BASE + '/videos/detail' + id + '.mp4';
    await c.save();
  }
  console.log('✅ 非遗 ' + cultures.length + ' 条已修复');

  // ========== 景点 ==========
  const spots = await Spot.find({});
  for (const s of spots) {
    const id = s.id;
    s.image = BASE + '/spots/spot' + id + '-1.jpg';
    s.images = [
      BASE + '/spots/spot' + id + '-1.jpg',
      BASE + '/spots/spot' + id + '-2.jpg',
      BASE + '/spots/spot' + id + '-3.jpg'
    ];
    s.videoUrl = BASE + '/videos/spot' + id + '.mp4';
    // 修复 heritages 子文档中的图片
    if (s.heritages) {
      for (const h of s.heritages) {
        h.image = BASE + '/details/detail' + h.id + '-1.jpg';
      }
    }
    await s.save();
  }
  console.log('✅ 景点 ' + spots.length + ' 条已修复');

  // ========== 美食 ==========
  const foods = await Food.find({});
  for (const f of foods) {
    const id = f.id;
    f.image = BASE + '/details/detail' + id + '-1.jpg';
    f.images = [
      BASE + '/details/detail' + id + '-1.jpg',
      BASE + '/details/detail' + id + '-2.jpg',
      BASE + '/details/detail' + id + '-3.jpg'
    ];
    f.videoUrl = BASE + '/videos/detail' + id + '.mp4';
    await f.save();
  }
  console.log('✅ 美食 ' + foods.length + ' 条已修复');

  // ========== 城市横幅 ==========
  const cityMap = {
    '兰州': 'lanzhou', '敦煌': 'dunhuang', '嘉峪关': 'jiayuguan', '张掖': 'zhangye',
    '武威': 'wuwei', '天水': 'tianshui', '平凉': 'pingliang', '庆阳': 'qingyang',
    '定西': 'dingxi', '陇南': 'longnan', '临夏': 'linxia', '甘南': 'gannan',
    '酒泉': 'jiuquan', '金昌': 'jinchang', '白银': 'baiyin'
  };
  const cities = await City.find({});
  for (const c of cities) {
    const py = cityMap[c.name] || c.name;
    c.banner = BASE + '/cities/city-' + py + '.jpg';
    if (c.heritages) {
      for (const h of c.heritages) {
        h.image = BASE + '/details/detail' + h.id + '-1.jpg';
      }
    }
    await c.save();
  }
  console.log('✅ 城市 ' + cities.length + ' 条已修复');

  // ========== 轮播 ==========
  const banners = await Banner.find({});
  for (const b of banners) {
    if (b.linkValue) {
      b.image = BASE + '/spots/spot' + b.linkValue + '-1.jpg';
    }
    await b.save();
  }
  console.log('✅ 轮播 ' + banners.length + ' 条已修复');

  console.log('\n🎉 全部媒体 URL 已更新为七牛云地址!');
  await mongoose.disconnect();
  process.exit(0);
}

fix().catch(err => { console.error(err); process.exit(1); });
