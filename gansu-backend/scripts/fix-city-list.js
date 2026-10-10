const fs=require('fs');
const f='C:/Users/34091/Desktop/cc+ds项目/uni app/非遗 支付宝云/unpackage/dist/dev/mp-weixin/pages/city-list/city-list.js';
let c=fs.readFileSync(f,'utf8');

// 1. Add API import
c=c.replace(
  'const data_images = require("../../data/images.js");',
  'const data_images = require("../../data/images.js");\nconst utils_api = require("../../utils/api.js");'
);

// 2. Truncate hardcoded cityDataMap (replace entire object with empty, keep API fallback)
const marker = 'const cityDataMap = ';
const marker2 = 'const cityInfo = common_vendor.ref';
const idx1 = c.indexOf(marker);
const idx2 = c.indexOf(marker2);
if (idx1 > 0 && idx2 > idx1) {
  c = c.substring(0, idx1) + 'const cityDataMap = {}; // API-first\n' + c.substring(idx2);
}

// 3. Replace onMounted
const oldOn = `common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options;
      const name = (options === null || options === void 0 ? null : options.city) || "兰州";
      cityName.value = name;
      const data = cityDataMap[name] || cityDataMap["兰州"];
      cityInfo.value = data;
      heritages.value = data.heritages;
    });`;

const newOn = `common_vendor.onMounted(async () => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options;
      const name = (options === null || options === void 0 ? null : options.city) || "兰州";
      cityName.value = name;
      try {
        const data = await utils_api.api.cities.detail(name);
        if (data) {
          cityInfo.value = data;
          heritages.value = data.heritages || [];
        }
      } catch (e) {
        const fallback = cityDataMap[name] || cityDataMap["兰州"];
        if (fallback && fallback.heritages) {
          cityInfo.value = fallback;
          heritages.value = fallback.heritages;
        }
      }
    });`;

if (c.includes(oldOn)) {
  c = c.replace(oldOn, newOn);
  console.log('onMounted replaced');
} else {
  console.log('WARNING: old onMounted not found');
}

fs.writeFileSync(f, c);
console.log('city-list.js done');
