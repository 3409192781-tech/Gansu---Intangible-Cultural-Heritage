const express = require('express');
const https = require('https');
const router = express.Router();

const SYSTEM_PROMPT = `你是"云游甘肃"小程序的AI文旅助手"驼小游"，像一位热情好客的甘肃当地人。

你的知识范围：
- 甘肃省旅游景点（莫高窟、鸣沙山、七彩丹霞、嘉峪关等31个景点）
- 非遗文化（花儿、陇剧、皮影戏、剪纸、唐卡等50项非遗）
- 特色美食（兰州牛肉面、手抓羊肉、酿皮子、甜醅子等）
- 文创产品（平凉剪纸、庆阳香包、敦煌壁画冰箱贴等）
- 旅行攻略、路线规划、交通建议

回答原则：
1. 优先用丰富的文旅知识回答甘肃相关问题，给出具体细节和实用建议
2. 对日常问题友好简答后，尝试引导回甘肃文旅话题
3. 语气亲切活泼、有温度，像一个熟悉甘肃的导游朋友
4. 回答简洁有力，控制在300字以内`;

// POST /api/ai/chat - 非流式 AI 对话
router.post('/chat', (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ code: 400, message: 'messages 不能为空', data: null });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ code: 500, message: 'DeepSeek API Key 未配置', data: null });
  }

  const fullMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.slice(-20)
  ];

  const postData = JSON.stringify({
    model: 'deepseek-v4-flash',
    messages: fullMessages,
    stream: false,
    max_tokens: 2048,
    temperature: 0.7
  });

  const options = {
    hostname: 'api.deepseek.com',
    path: '/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let body = '';
    apiRes.on('data', (chunk) => { body += chunk; });
    apiRes.on('end', () => {
      if (apiRes.statusCode !== 200) {
        console.error('DeepSeek API 错误:', apiRes.statusCode, body);
        return res.status(500).json({ code: 500, message: 'AI 服务暂时不可用', data: null });
      }
      try {
        const json = JSON.parse(body);
        const content = json.choices?.[0]?.message?.content || '';
        res.json({ code: 200, message: '操作成功', data: { content } });
      } catch (e) {
        console.error('DeepSeek 响应解析失败:', e);
        res.status(500).json({ code: 500, message: 'AI 响应解析失败', data: null });
      }
    });
  });

  apiReq.on('error', (err) => {
    console.error('AI 请求错误:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  });

  apiReq.write(postData);
  apiReq.end();
});


// POST /api/ai/trip-plan - AI travel plan generator
router.post('/trip-plan', (req, res) => {
  const { type, name, description, duration, people, preferences, budget } = req.body;

  if (!type || !name) {
    return res.status(400).json({ code: 400, message: 'type 和 name 不能为空', data: null });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ code: 500, message: 'DeepSeek API Key 未配置', data: null });
  }

  const prefsText = preferences && preferences.length > 0 ? preferences.join('、') : '无特殊偏好';
  const durText = duration || '未指定';
  const pplText = people || 1;
  const budgetText = budget || '未指定';
  const descText = description || '暂无详细介绍';

  let prompt = '';
  if (type === 'food') {
    prompt = `请为用户推荐"${name}"相关的甘肃美食体验：
- 简介：${descText}
- 预算：${budgetText}
- 人数：${pplText}人
- 偏好：${prefsText}

请包含：推荐菜品/店铺、人均消费、品尝建议。控制在300字以内，语气亲切活泼。`;
  } else if (type === 'guide') {
    prompt = `请根据以下攻略信息为用户制定详细的旅行建议：
- 攻略：${name}
- 内容：${descText}
- 可用时间：${durText}
- 人数：${pplText}人
- 偏好：${prefsText}

请以攻略补充形式输出，包含：交通建议、住宿推荐、最佳季节、注意事项。控制在300字以内，语气亲切活泼。`;
  } else {
    prompt = `你是甘肃文旅AI助手。请根据以下信息为用户制定游玩计划：
- ${type === 'spot' ? '景点' : '项目'}：${name}
- 简介：${descText}
- 可用时间：${durText}
- 人数：${pplText}人
- 偏好：${prefsText}

请以攻略形式输出，包含：
1. 推荐游览路线（按时间分配）
2. 必看亮点
3. 交通/门票实用提示
4. 附近美食推荐
控制在400字以内，语气亲切活泼。`;
  }

  const postData = JSON.stringify({
    model: 'deepseek-v4-flash',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    stream: false,
    max_tokens: 2048,
    temperature: 0.7
  });

  const options = {
    hostname: 'api.deepseek.com',
    path: '/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let body = '';
    apiRes.on('data', (chunk) => { body += chunk; });
    apiRes.on('end', () => {
      if (apiRes.statusCode !== 200) {
        console.error('DeepSeek API 错误:', apiRes.statusCode, body);
        return res.status(500).json({ code: 500, message: 'AI 服务暂时不可用', data: null });
      }
      try {
        const json = JSON.parse(body);
        const content = json.choices?.[0]?.message?.content || '';
        res.json({ code: 200, message: '操作成功', data: { content } });
      } catch (e) {
        console.error('DeepSeek 响应解析失败:', e);
        res.status(500).json({ code: 500, message: 'AI 响应解析失败', data: null });
      }
    });
  });

  apiReq.on('error', (err) => {
    console.error('AI 请求错误:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  });

  apiReq.write(postData);
  apiReq.end();
});

module.exports = router;
