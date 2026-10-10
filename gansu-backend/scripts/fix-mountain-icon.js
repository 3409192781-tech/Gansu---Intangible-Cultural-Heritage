const fs=require('fs');

const mountainCSS=`
\t.section-icon-spot {
\t\tbackground: linear-gradient(135deg, #4A8F6D, #2E6B4F) !important;
\t}
\t.icon-mountain {
\t\twidth: 24rpx;
\t\theight: 20rpx;
\t\tposition: relative;
\t}
\t.icon-mountain:before {
\t\tcontent: '';
\t\tposition: absolute;
\t\ttop: 0;
\t\tleft: 50%;
\t\ttransform: translateX(-50%);
\t\twidth: 0;
\t\theight: 0;
\t\tborder-left: 8rpx solid transparent;
\t\tborder-right: 8rpx solid transparent;
\t\tborder-bottom: 12rpx solid #FFF8E7;
\t}
\t.icon-mountain:after {
\t\tcontent: '';
\t\tposition: absolute;
\t\ttop: 4rpx;
\t\tleft: 50%;
\t\ttransform: translateX(-50%);
\t\twidth: 18rpx;
\t\theight: 4rpx;
\t\tbackground: #FFF8E7;
\t\tborder-radius: 2rpx;
\t}
`;

// 1. Fix source uvue
let f='C:/Users/34091/Desktop/cc+ds项目/uni app/非遗 支付宝云/pages/city-list/city-list.uvue';
let c=fs.readFileSync(f,'utf8');
c=c.replace('.intro-section {', mountainCSS+'\n.intro-section {');
fs.writeFileSync(f,c);
console.log('1. source uvue fixed');

// 2. Fix compiled wxss
f='C:/Users/34091/Desktop/cc+ds项目/uni app/非遗 支付宝云/unpackage/dist/dev/mp-weixin/pages/city-list/city-list.wxss';
c=fs.readFileSync(f,'utf8');
const wxssMountain='.section-icon-spot{background:linear-gradient(135deg,#4A8F6D,#2E6B4F)!important}.icon-mountain{width:24rpx;height:20rpx;position:relative}.icon-mountain:before{content:\'\';position:absolute;top:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8rpx solid transparent;border-right:8rpx solid transparent;border-bottom:12rpx solid #FFF8E7}.icon-mountain:after{content:\'\';position:absolute;top:4rpx;left:50%;transform:translateX(-50%);width:18rpx;height:4rpx;background:#FFF8E7;border-radius:2rpx}';
c=c.replace('.intro-section{', wxssMountain+'.intro-section{');
fs.writeFileSync(f,c);
console.log('2. compiled wxss fixed');
