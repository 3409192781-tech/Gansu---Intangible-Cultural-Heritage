const fs = require('fs');

// 1. Fix source uvue
const f = 'C:/Users/34091/Desktop/cc+ds项目/uni app/非遗 支付宝云/pages/city-list/city-list.uvue';
let c = fs.readFileSync(f, 'utf8');

// Add spots section template before intro-section
const spotsTemplate = `\t\t\t<view class="spots-section">
\t\t\t\t<view class="section-header">
\t\t\t\t\t<view class="section-icon section-icon-spot">
\t\t\t\t\t\t<view class="icon-mountain"></view>
\t\t\t\t\t</view>
\t\t\t\t\t<text class="section-title">热门景点</text>
\t\t\t\t\t<view class="section-line"></view>
\t\t\t\t</view>
\t\t\t\t<view class="spots-grid">
\t\t\t\t\t<view class="spot-card" v-for="(item, index) in citySpots" :key="index" @click="goToDetail(item.id)">
\t\t\t\t\t\t<image :src="item.image" mode="aspectFill" class="spot-image"></image>
\t\t\t\t\t\t<view class="spot-info">
\t\t\t\t\t\t\t<text class="spot-name">{{item.name}}</text>
\t\t\t\t\t\t\t<text class="spot-location">{{item.location}}</text>
\t\t\t\t\t\t</view>
\t\t\t\t\t\t<view class="spot-arrow"></view>
\t\t\t\t\t</view>
\t\t\t\t</view>
\t\t\t</view>

\t\t\t`;

c = c.replace('<view class="intro-section">', spotsTemplate + '<view class="intro-section">');

// Add citySpots ref
c = c.replace(
  'const cityInfo = ref<any>({})\n\t\tconst heritages = ref<any[]>([])',
  'const cityInfo = ref<any>({})\n\t\tconst heritages = ref<any[]>([])\n\t\tconst citySpots = ref<any[]>([])'
);

// Also handle the compiled version's format
c = c.replace(
  'const heritages = ref([])',
  'const heritages = ref([])\n\t\tconst citySpots = ref([])'
);

// Load spots in onMounted (API path)
c = c.replace(
  'heritages.value = data.heritages || []\n\t\t\t\t\t\tcitySpots.value = data.spots || []\n\t\t\t\t\t\treturn',
  'heritages.value = data.heritages || []\n\t\t\t\t\t\tcitySpots.value = data.spots || []\n\t\t\t\t\t\treturn'
);

// Load spots in onMounted (API path - second pattern)
c = c.replace(
  'heritages.value = data.heritages || []\n\t\t\t\treturn',
  'heritages.value = data.heritages || []\n\t\t\t\tcitySpots.value = data.spots || []\n\t\t\t\treturn'
);

// Load spots in onMounted (fallback path)
c = c.replace(
  "heritages.value = data.heritages || []\n\t\t})",
  "heritages.value = data.heritages || []\n\t\t\tcitySpots.value = data.spots || []\n\t\t})"
);

// Add spots CSS before .intro-section
const spotsCSS = `
\t.spots-section {
\t\tpadding: 28rpx 20rpx;
\t}

\t.spots-section .section-icon-spot {
\t\tbackground: rgba(74, 143, 109, 0.1);
\t}

\t.spots-grid {
\t\tpadding: 0 4rpx;
\t}

\t.spot-card {
\t\tdisplay: flex;
\t\tflex-direction: row;
\t\talign-items: center;
\t\tpadding: 16rpx;
\t\tmargin-bottom: 16rpx;
\t\tbackground: #FFFFFF;
\t\tborder-radius: 16rpx;
\t\tbox-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.08);
\t}

\t.spot-image {
\t\twidth: 120rpx;
\t\theight: 90rpx;
\t\tborder-radius: 12rpx;
\t\tflex-shrink: 0;
\t}

\t.spot-info {
\t\tflex: 1;
\t\tmargin-left: 20rpx;
\t}

\t.spot-name {
\t\tfont-size: 28rpx;
\t\tcolor: #2C1810;
\t\tfont-weight: 600;
\t\tmargin-bottom: 6rpx;
\t}

\t.spot-location {
\t\tfont-size: 22rpx;
\t\tcolor: #9A8B7A;
\t}

\t.spot-arrow {
\t\twidth: 12rpx;
\t\theight: 12rpx;
\t\tborder-top: 3rpx solid #CCC;
\t\tborder-right: 3rpx solid #CCC;
\t\ttransform: rotate(45deg);
\t\tflex-shrink: 0;
\t}
`;

c = c.replace('.intro-section {', spotsCSS + '\n\t.intro-section {');

fs.writeFileSync(f, c);
console.log('1. city-list.uvue updated');

// 2. Fix compiled JS
const jf = 'C:/Users/34091/Desktop/cc+ds项目/uni app/非遗 支付宝云/unpackage/dist/dev/mp-weixin/pages/city-list/city-list.js';
if (fs.existsSync(jf)) {
  let j = fs.readFileSync(jf, 'utf8');

  // Add citySpots ref
  j = j.replace(
    'const heritages = common_vendor.ref([]);',
    'const heritages = common_vendor.ref([]);\n    const citySpots = common_vendor.ref([]);'
  );

  // Load spots in onMounted
  j = j.replace(
    'heritages.value = data.heritages || [];',
    'heritages.value = data.heritages || [];\n          citySpots.value = data.spots || [];'
  );

  // Add spots to the render return
  if (j.includes('__returned__') && !j.includes('citySpots')) {
    j = j.replace(
      'b: common_vendor.t(cityInfo.value.name),',
      'b: common_vendor.t(cityInfo.value.name),\n          citySpots: citySpots.value,'
    );
  }

  fs.writeFileSync(jf, j);
  console.log('2. city-list.js updated');
}

// 3. Fix compiled WXML
const wf = 'C:/Users/34091/Desktop/cc+ds项目/uni app/非遗 支付宝云/unpackage/dist/dev/mp-weixin/pages/city-list/city-list.wxml';
if (fs.existsSync(wf)) {
  let w = fs.readFileSync(wf, 'utf8');

  // Add spots section before intro-section
  const spotsWxml = '<view class="spots-section"><view class="section-header"><view class="section-icon section-icon-spot"><view class="icon-mountain"></view></view><text class="section-title">热门景点</text><view class="section-line"></view></view><view class="spots-grid"><view wx:for="{{citySpots}}" wx:for-item="item" wx:key="a" class="spot-card" bindtap="{{item.d}}"><image src="{{item.a}}" mode="aspectFill" class="spot-image"></image><view class="spot-info"><text class="spot-name">{{item.b}}</text><text class="spot-location">{{item.c}}</text></view><view class="spot-arrow"></view></view></view></view>';

  w = w.replace('<view class="intro-section">', spotsWxml + '<view class="intro-section">');
  fs.writeFileSync(wf, w);
  console.log('3. city-list.wxml updated');
}

// 4. Fix compiled WXSS
const sf = 'C:/Users/34091/Desktop/cc+ds项目/uni app/非遗 支付宝云/unpackage/dist/dev/mp-weixin/pages/city-list/city-list.wxss';
if (fs.existsSync(sf)) {
  let s = fs.readFileSync(sf, 'utf8');
  const spotsWxss = '.spots-section{padding:28rpx 20rpx}.spots-section .section-icon-spot{background:rgba(74,143,109,0.1)}.spots-grid{padding:0 4rpx}.spot-card{display:flex;flex-direction:row;align-items:center;padding:16rpx;margin-bottom:16rpx;background:#FFFFFF;border-radius:16rpx;box-shadow:0 4rpx 16rpx rgba(139,69,19,0.08)}.spot-image{width:120rpx;height:90rpx;border-radius:12rpx;flex-shrink:0}.spot-info{flex:1;margin-left:20rpx}.spot-name{font-size:28rpx;color:#2C1810;font-weight:600;margin-bottom:6rpx}.spot-location{font-size:22rpx;color:#9A8B7A}.spot-arrow{width:12rpx;height:12rpx;border-top:3rpx solid #CCC;border-right:3rpx solid #CCC;transform:rotate(45deg);flex-shrink:0}';
  s = s.replace('.intro-section{', spotsWxss + '.intro-section{');
  fs.writeFileSync(sf, s);
  console.log('4. city-list.wxss updated');
}

console.log('Done!');
