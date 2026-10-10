const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const https = require('https');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');
const { success, error } = require('../utils/response');

// 登录限流：15分钟最多10次失败尝试
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: '登录尝试过多，请15分钟后再试' }
});

// 管理员登录
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json(error('请输入用户名和密码'));
    }

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json(error('用户名或密码错误'));
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json(error('用户名或密码错误'));
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json(success({
      token,
      username: admin.username,
      id: admin._id
    }, '登录成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// 微信登录
router.post('/wechat-login', async (req, res) => {
  try {
    const { code, nickName, avatarUrl } = req.body;

    if (!code) {
      return res.status(400).json(error('缺少登录凭证'));
    }

    // 1. 用 code 换取 openid
    const openid = await new Promise((resolve, reject) => {
      const url = 'https://api.weixin.qq.com/sns/jscode2session'
        + '?appid=' + process.env.WX_APPID
        + '&secret=' + process.env.WX_SECRET
        + '&js_code=' + code
        + '&grant_type=authorization_code';

      https.get(url, (resp) => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
          const result = JSON.parse(data);
          if (result.openid) {
            resolve(result.openid);
          } else {
            reject(new Error(result.errmsg || '微信登录失败'));
          }
        });
      }).on('error', reject);
    });

    // 2. 查找或创建用户
    let user = await User.findOne({ openid });
    if (!user) {
      user = await User.create({
        openid,
        nickName: nickName || '微信用户',
        avatarUrl: avatarUrl || '',
        lastLoginAt: new Date()
      });
    } else {
      user.lastLoginAt = new Date();
      if (nickName) user.nickName = nickName;
      if (avatarUrl) user.avatarUrl = avatarUrl;
      await user.save();
    }

    // 3. 生成 JWT
    const token = jwt.sign(
      { id: user._id, openid: user.openid },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json(success({
      token,
      userInfo: {
        id: user._id,
        openid: user.openid,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl
      }
    }, '登录成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

module.exports = router;