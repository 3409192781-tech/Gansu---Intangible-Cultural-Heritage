const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { unauthorized } = require('../utils/response');

// 用户端 JWT 验证（轻量版，区别于 admin protect）
// 返回 req.user = { openid, ... }
const userAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json(unauthorized('请先登录'));
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret, { algorithms: jwtConfig.algorithms || ['HS256'] });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json(unauthorized('登录已过期，请重新登录'));
  }
};

// 可选验证：有 token 则解析，无则放过
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      req.user = jwt.verify(token, jwtConfig.secret, { algorithms: jwtConfig.algorithms || ['HS256'] });
    } catch (err) {
      // token 无效也放过
    }
  }
  next();
};

module.exports = { userAuth, optionalAuth };
