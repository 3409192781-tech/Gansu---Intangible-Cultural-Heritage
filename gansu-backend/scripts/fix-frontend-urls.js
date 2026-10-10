// 修复前端编译输出中的 Unsplash 占位URL
const fs = require('fs');
const path = require('path');

const DIR = 'C:/Users/34091/Desktop/cc+ds项目/uni app/非遗 支付宝云/unpackage/dist/dev/mp-weixin';
const BASE = 'https://img.gansu-culture.xyz';
const PLACEHOLDER = BASE + '/details/detail1-1.jpg';

const files = [
  'pages/culture-list/culture-list.js',
  'pages/spot-list/spot-list.js',
  'pages/food-list/food-list.js',
  'pages/index/index.js',
  'pages/detail/detail.js',
  'pages/detail/detail.wxml',
];

let total = 0;
files.forEach(f => {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) { console.log('MISSING:', f); return; }
  let c = fs.readFileSync(p, 'utf8');
  const before = c.length;

  // 替换所有 Unsplash URL
  c = c.replace(/https:\/\/images\.unsplash\.com\/[^\s"')]*/g, PLACEHOLDER);

  const n = (c.match(/img\.gansu-culture/g) || []).length;
  total += n;
  fs.writeFileSync(p, c);
  console.log(f, ': OK');
});

console.log('Total Unsplash URLs replaced:', total);
