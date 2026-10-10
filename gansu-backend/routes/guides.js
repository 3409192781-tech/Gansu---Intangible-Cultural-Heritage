const express = require('express');
const router = express.Router();
const https = require('https');
const Guide = require('../models/Guide');
const { protect } = require('../middleware/auth');
const { success, error, pagination } = require('../utils/response');

const CATEGORIES = {
  family: '亲子游', self_drive: '自驾游', photo: '摄影游',
  deep: '深度游', food: '美食游', history: '文史游',
  weekend: '周末游', budget: '穷游'
};

// ==========================================
// 公开 - 攻略列表 (分页 + 筛选)
// ==========================================
router.get('/', async (req, res) => {
  try {
    var page = parseInt(req.query.page, 10) || 1;
    var pageSize = parseInt(req.query.pageSize, 10) || 20;
    var keyword = req.query.keyword;
    var category = req.query.category;
    var type = req.query.type;
    var admin = req.query.admin;

    var filter = {};
    if (!admin) filter.status = 1;
    else if (req.query.status !== undefined) filter.status = parseInt(req.query.status, 10);

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { summary: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (type) filter.type = type;

    var total = await Guide.countDocuments(filter);
    var guides = await Guide.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select('-content');  // 列表不返回正文，days 需保留供管理端编辑

    res.json(success(pagination(guides, total, page, pageSize)));
  } catch (e) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 公开 - 攻略详情
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    var guide = await Guide.findOne({ id: req.params.id });
    if (!guide || (guide.status !== 1 && !req.query.admin)) {
      return res.status(404).json(error('攻略不存在', 404));
    }
    // 自增浏览量
    guide.views = (guide.views || 0) + 1;
    await guide.save();
    res.json(success(guide));
  } catch (e) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 保护 - 新增攻略
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    var body = req.body;
    if (!body.title || !body.coverImage) {
      return res.status(400).json(error('标题和封面图为必填项', 400));
    }
    // 自动生成 ID
    if (!body.id) {
      var max = await Guide.findOne().sort({ id: -1 }).select('id');
      var maxId = max && max.id ? parseInt(max.id, 10) : 400;
      if (maxId < 400) maxId = 400;
      body.id = String(maxId + 1);
    }
    var guide = await Guide.create(body);
    res.json(success(guide, '攻略创建成功'));
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json(error('攻略ID已存在', 400));
    }
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 保护 - 编辑攻略
// ==========================================
router.put('/:id', protect, async (req, res) => {
  try {
    var guide = await Guide.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!guide) return res.status(404).json(error('攻略不存在', 404));
    res.json(success(guide, '攻略已更新'));
  } catch (e) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 保护 - 删除攻略
// ==========================================
router.delete('/:id', protect, async (req, res) => {
  try {
    var guide = await Guide.findOneAndDelete({ id: req.params.id });
    if (!guide) return res.status(404).json(error('攻略不存在', 404));
    res.json(success(null, '已删除'));
  } catch (e) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 保护 - AI 生成攻略草稿
// ==========================================
router.post('/ai-generate', protect, async (req, res) => {
  try {
    var { destination, type, days } = req.body;
    if (!destination) {
      return res.status(400).json(error('请输入目的地', 400));
    }

    var typeLabel = type === 'itinerary' ? '线路行程' : '游记攻略';
    var daysHint = days ? `，行程${days}天` : '';

    var prompt = `你是一个专业的甘肃旅游攻略写作助手。请为"${destination}"生成一篇${typeLabel}${daysHint}。

要求：
1. 标题要有吸引力，体现${destination}的特色
2. 封面图描述用 http://placeholder（我会替换）
3. summary用1-2句话概括
4. tags用数组，3-5个关键词
5. category从以下选一个：family亲子游 self_drive自驾游 photo摄影游 deep深度游 food美食游 history文史游 weekend周末游 budget穷游
${type === 'itinerary' ? '6. days数组，每天包含day编号/title/spots景点数组/description' : '6. content写500字左右的游记正文'}
7. tips数组3-5条实用建议

请严格按JSON格式输出，不要有其他文字：
{
  "title": "...",
  "summary": "...",
  "category": "...",
  "tags": ["...", "..."],
  ${type === 'itinerary' ? '"days": [{"day":1,"title":"...","spots":["景点1","景点2"],"description":"..."}]' : '"content": "..."'},
  "tips": ["...", "..."]
}`;

    var postData = JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      max_tokens: 2048,
      temperature: 0.8
    });

    var result = await new Promise((resolve, reject) => {
      var req2 = https.request({
        hostname: 'api.deepseek.com',
        path: '/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY
        }
      }, (resp) => {
        var data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
          try {
            var json = JSON.parse(data);
            var text = json.choices?.[0]?.message?.content || '';
            // 提取 JSON
            var match = text.match(/\{[\s\S]*\}/);
            if (match) {
              resolve(JSON.parse(match[0]));
            } else {
              resolve({ raw: text });
            }
          } catch (e) { reject(new Error('AI响应解析失败')); }
        });
      });
      req2.on('error', reject);
      req2.write(postData);
      req2.end();
    });

    // 附加元数据
    result.type = type || 'article';
    result.aiGenerated = true;
    result.coverImage = 'http://placeholder';
    result.author = 'AI助手';

    res.json(success(result, 'AI草稿已生成'));
  } catch (e) {
    res.status(500).json(error('AI生成失败，请重试'));
  }
});

module.exports = router;
