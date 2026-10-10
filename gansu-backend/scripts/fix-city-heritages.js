// 只修复 MongoDB 中城市数据的错误 heritage 引用
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const City = require('../models/City');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('已连接 MongoDB');

  // 修复 兰州：删除 id:4 name:兰州太平鼓（id:4 是夜光杯雕）
  let lz = await City.findOne({ name: '兰州' });
  if (lz) {
    lz.heritages = lz.heritages.filter(h => h.id !== '4');
    await lz.save();
    console.log('兰州已修复，剩余heritages:', lz.heritages.map(h => h.id + ':' + h.name));
  }

  // 修复 定西：删除 id:17 name:定西剪纸（id:17 是酒泉剪纸）
  let dx = await City.findOne({ name: '定西' });
  if (dx) {
    dx.heritages = dx.heritages.filter(h => h.id !== '17');
    await dx.save();
    console.log('定西已修复，剩余heritages:', dx.heritages.map(h => h.id + ':' + h.name));
  }

  console.log('✅ 城市heritage引用修复完成');
  await mongoose.disconnect();
  process.exit(0);
}

fix().catch(err => { console.error(err); process.exit(1); });
