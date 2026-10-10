// 迁移脚本：新增 10 个景点 (ID 116-125) 到生产数据库
// SSH 到服务器后运行: node migrate-add-spots.js
require('dotenv').config();
const mongoose = require('mongoose');
const Spot = require('./models/Spot');

const SPOT_IMG = 'https://img.gansu-culture.xyz/spots/spot101-1.jpg';
const makeImgs = (src) => [src, src, src];

const newSpots = [
  { id: '116', name: '玉门关', image: SPOT_IMG, tags: ['世界文化遗产', '丝绸之路', '历史古迹'], location: '敦煌市', rating: 4.8, reviews: 8960, type: 'spot', area: '敦煌', level: '4A', category: 'culture', isHot: true, description: '玉门关，始置于汉武帝开通西域道路、设置河西四郡之时，因西域输入玉石时取道于此而得名。是古丝绸之路通往西域的咽喉要道，"羌笛何须怨杨柳，春风不度玉门关"的千古绝唱让这座雄关名扬天下。', openTime: '08:00 - 18:00', ticketInfo: '全价票：40元/人\n优惠票：20元/人', transport: '公交：敦煌市区乘景区专线\n自驾：距敦煌市区约90公里，车程约1.5小时', tips: ['建议请讲解员了解历史', '日落时分景色最佳', '注意防晒防风沙', '汉长城遗址就在旁边'], images: makeImgs(SPOT_IMG), videoUrl: '', heritages: ['9', '10'], sortOrder: 16 },
  { id: '117', name: '阳关遗址', image: SPOT_IMG, tags: ['AAAA级景区', '丝绸之路', '历史古迹'], location: '敦煌市', rating: 4.6, reviews: 6780, type: 'spot', area: '敦煌', level: '4A', category: 'culture', description: '阳关位于敦煌市西南70公里处，因位于玉门关之南而得名，与玉门关同为丝绸之路的重要关隘。唐代诗人王维"劝君更尽一杯酒，西出阳关无故人"让阳关成为千古送别之地。', openTime: '08:00 - 18:00', ticketInfo: '全价票：50元/人\n优惠票：25元/人', transport: '公交：敦煌市区乘阳关专线\n自驾：距敦煌市区约70公里，车程约1小时', tips: ['可以体验古代出关仪式', '阳关博物馆值得一看', '注意防晒防风沙', '建议早晚游览'], images: makeImgs(SPOT_IMG), videoUrl: '', heritages: ['9', '10'], sortOrder: 17 },
  { id: '118', name: '马蹄寺石窟', image: SPOT_IMG, tags: ['AAAA级景区', '佛教艺术', '悬崖石窟'], location: '张掖市肃南县', rating: 4.7, reviews: 5680, type: 'spot', area: '张掖', level: '4A', category: 'culture', isHot: true, description: '马蹄寺石窟位于张掖市肃南裕固族自治县，因传说中的天马在此饮水留下蹄印而得名。石窟群开凿于北凉时期，集石窟艺术、祁连山风光和裕固族风情于一体，被誉为"长在绝壁上的石窟"。', openTime: '08:00 - 17:30', ticketInfo: '全价票：74元/人\n优惠票：37元/人', transport: '公交：张掖汽车南站乘马蹄寺班车\n自驾：距张掖市区约65公里，车程约1.5小时', tips: ['建议安排半天时间游览', '山上温度较低注意保暖', '可以体验裕固族风情', '石窟内禁止拍照'], images: makeImgs(SPOT_IMG), videoUrl: '', heritages: ['39', '40'], sortOrder: 18 },
  { id: '119', name: '官鹅沟', image: SPOT_IMG, tags: ['AAAAA级景区', '国家森林公园', '自然奇观'], location: '陇南市宕昌县', rating: 4.8, reviews: 7650, type: 'spot', area: '陇南', level: '5A', category: 'nature', isHot: true, description: '官鹅沟国家森林公园位于陇南市宕昌县，集森林景观、地貌景观、水体景观于一体，有大小瀑布20余处，湖泊30余个，被誉为"甘肃小九寨"。', openTime: '07:30 - 18:00', ticketInfo: '全价票：120元/人\n优惠票：60元/人', transport: '公交：宕昌县城乘景区公交\n自驾：距县城约10公里，车程约20分钟', tips: ['建议安排一整天游览', '景区较大建议乘坐观光车', '春秋季景色最美', '可以住宿沟口民宿'], images: makeImgs(SPOT_IMG), videoUrl: '', heritages: ['25', '26'], sortOrder: 19 },
  { id: '120', name: '扎尕那', image: SPOT_IMG, tags: ['AAAA级景区', '世外桃源', '藏乡风情'], location: '甘南州迭部县', rating: 4.9, reviews: 9860, type: 'spot', area: '甘南', level: '4A', category: 'nature', isHot: true, description: '扎尕那位于甘南藏族自治州迭部县，藏语意为"石匣子"，是一座完整的天然石城。被《中国国家地理》评为"中国十大非著名山峰"之一。', openTime: '全天开放', ticketInfo: '景区门票：80元/人\n（含四个观景台）', transport: '公交：迭部县城乘扎尕那班车\n自驾：距县城约30公里，车程约50分钟', tips: ['日出和晨雾是最佳拍摄时间', '山路崎岖注意安全', '海拔较高注意防高反', '建议住宿一晚体验藏寨生活'], images: makeImgs(SPOT_IMG), videoUrl: '', heritages: ['34'], sortOrder: 20 },
  { id: '121', name: '黄河石林', image: SPOT_IMG, tags: ['AAAA级景区', '国家地质公园', '地质奇观'], location: '白银市景泰县', rating: 4.7, reviews: 6340, type: 'spot', area: '白银', level: '4A', category: 'nature', isHot: true, description: '黄河石林国家地质公园位于白银市景泰县，生成于210万年前的新生代第四纪，石林千姿百态、鬼斧神工，与蜿蜒的黄河水相映成趣，被誉为"中华自然奇观"。', openTime: '07:30 - 18:00', ticketInfo: '全价票：80元/人\n优惠票：40元/人', transport: '公交：景泰县城乘景区班车\n自驾：距县城约40公里，车程约1小时', tips: ['可以乘坐羊皮筏子漂流黄河', '饮马沟是最佳摄影点', '夏季注意防晒', '建议穿防滑鞋子'], images: makeImgs(SPOT_IMG), videoUrl: '', heritages: ['27', '28'], sortOrder: 21 },
  { id: '122', name: '伏羲庙', image: SPOT_IMG, tags: ['AAAA级景区', '华夏始祖', '历史文化'], location: '天水市秦州区', rating: 4.8, reviews: 8960, type: 'spot', area: '天水', level: '4A', category: 'culture', description: '伏羲庙位于天水市秦州区，始建于明成化年间，是中国规模最大、保存最完整的祭祀伏羲的明代建筑群，是海内外华夏儿女寻根祭祖的圣地。', openTime: '08:00 - 17:30', ticketInfo: '全价票：40元/人\n优惠票：20元/人', transport: '公交：天水火车站乘6路公交到伏羲庙站\n自驾：距市中心约2公里', tips: ['建议请讲解员了解伏羲文化', '祭祀大典期间最热闹', '可以购买伏羲文化纪念品', '注意参观礼仪'], images: makeImgs(SPOT_IMG), videoUrl: '', heritages: ['37', '16'], sortOrder: 22 },
  { id: '123', name: '大佛寺', image: SPOT_IMG, tags: ['AAAA级景区', '西夏文化', '历史古迹'], location: '张掖市甘州区', rating: 4.7, reviews: 7120, type: 'spot', area: '张掖', level: '4A', category: 'culture', description: '大佛寺位于张掖市甘州区，始建于西夏永安元年，因寺内供奉的国内现存最大室内涅槃像而闻名，卧佛身长34.5米，是西夏佛教艺术的杰出代表。', openTime: '08:00 - 17:30', ticketInfo: '全价票：40元/人\n优惠票：20元/人', transport: '公交：张掖火车站乘1路公交到大佛寺站\n自驾：距市中心约1公里', tips: ['大佛殿内禁止拍照', '建议请讲解员了解西夏历史', '可以参观藏经殿', '春季有庙会活动'], images: makeImgs(SPOT_IMG), videoUrl: '', heritages: ['13', '14'], sortOrder: 23 },
  { id: '124', name: '郎木寺', image: SPOT_IMG, tags: ['AAAA级景区', '藏传佛教', '甘川交界'], location: '甘南州碌曲县', rating: 4.7, reviews: 5780, type: 'spot', area: '甘南', level: '4A', category: 'ethnic', description: '郎木寺位于甘南藏族自治州碌曲县，横跨甘肃四川两省，藏、回、汉民族文化在此交融，被誉为"东方小瑞士"。', openTime: '08:00 - 18:00', ticketInfo: '甘肃郎木寺：30元/人\n四川格尔底寺：30元/人', transport: '公交：合作市乘郎木寺班车\n自驾：距合作市约120公里，车程约2.5小时', tips: ['天葬台请勿拍照', '请尊重藏族宗教习俗', '早晚温差大注意保暖', '可以品尝藏餐和酥油茶'], images: makeImgs(SPOT_IMG), videoUrl: '', heritages: ['33', '34', '50'], sortOrder: 24 },
  { id: '125', name: '锁阳城遗址', image: SPOT_IMG, tags: ['世界文化遗产', '丝绸之路', '历史遗迹'], location: '酒泉市瓜州县', rating: 4.6, reviews: 3450, type: 'spot', area: '酒泉', level: '4A', category: 'culture', description: '锁阳城遗址位于酒泉市瓜州县，是丝绸之路上保存最为完整、规模最大的唐代古城遗址之一，2014年列入世界文化遗产名录。', openTime: '08:30 - 17:30', ticketInfo: '全价票：50元/人\n优惠票：25元/人', transport: '公交：瓜州县城乘锁阳城专线\n自驾：距县城约70公里，车程约1.5小时', tips: ['可以参观遗址博物馆', '春季锁阳花开景色最美', '注意防晒防风沙', '建议请讲解员了解丝路历史'], images: makeImgs(SPOT_IMG), videoUrl: '', heritages: ['17', '4'], sortOrder: 25 }
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB 连接成功');

  for (const spot of newSpots) {
    const exists = await Spot.findOne({ id: spot.id });
    if (exists) {
      console.log('跳过 ' + spot.id + ' ' + spot.name + '（已存在）');
      continue;
    }
    await Spot.create(spot);
    console.log('创建 ' + spot.id + ' ' + spot.name);
  }

  const count = await Spot.countDocuments({ status: 1 });
  console.log('景点总数: ' + count);
  await mongoose.disconnect();
  console.log('完成!');
})();
