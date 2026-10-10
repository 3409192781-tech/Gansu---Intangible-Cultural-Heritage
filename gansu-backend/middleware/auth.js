const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { unauthorized } = require('../utils/response');

const protect = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json(unauthorized('请先登录'));
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret, { algorithms: jwtConfig.algorithms || ['HS256'] });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json(unauthorized('token无效'));
  }
};

module.exports = { protect };