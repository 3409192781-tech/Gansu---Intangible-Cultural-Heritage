// 数据重新初始化脚本
// 用法: node reinit-db.js
// 连接到生产 MongoDB 并重新写入种子数据
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('已连接 MongoDB:', process.env.MONGO_URI);

  const initData = require('./data/initData');
  await initData();

  console.log('✅ 数据重新初始化完成!');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('初始化失败:', err);
  process.exit(1);
});
