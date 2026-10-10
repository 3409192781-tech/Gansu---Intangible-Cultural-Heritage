require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const app = express();

const initData = require('./data/initData');

const startServer = async () => {
  if (process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { dbName: 'gansu_culture' });
    console.log(`MongoDB内存数据库连接成功: 127.0.0.1`);
    await initData();
  } else {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB连接成功`);
  }

  // ════════════════════════════════════════════════════════
  // 安全中间件
  // ════════════════════════════════════════════════════════

  // 1. 安全头 (禁用CSP和跨域资源策略避免拦截静态资源)
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  // 2. CORS 白名单
  app.use(cors({
    origin: ['https://gansu-culture.xyz', 'http://gansu-culture.xyz', 'http://YOUR_SERVER_IP', 'http://localhost:3000'],
    credentials: true
  }));

  // 3. 请求体大小限制 (防 DoS)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. 请求日志
  if (process.env.USE_MEMORY_DB !== 'true') {
    app.use(morgan('short'));
  }

  // 5. 全局速率限制 (15分钟200次)
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { code: 429, message: '请求过于频繁，请稍后再试' }
  });
  app.use('/api', globalLimiter);

  // ════════════════════════════════════════════════════════
  // 路由
  // ════════════════════════════════════════════════════════
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/cultures', require('./routes/cultures'));
  app.use('/api/spots', require('./routes/spots'));
  app.use('/api/events', require('./routes/events'));
  app.use('/api/banners', require('./routes/banners'));
  app.use('/api/quick-entries', require('./routes/quick-entries'));
  app.use('/api/foods', require('./routes/foods'));
  app.use('/api/cities', require('./routes/cities'));
	app.use('/api/guides', require('./routes/guides'));
  app.use('/api/home', require('./routes/home'));
  app.use('/api/search', require('./routes/search'));
  app.use('/api/products', require('./routes/products'));
  app.use('/api/favorites', require('./routes/favorites'));
  app.use('/api/ai', require('./routes/ai'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/payment', require('./routes/payment'));
  app.use('/api/settings', require('./routes/settings'));
  app.use('/api/admin', require('./routes/admin'));

  // 管理后台静态文件
  app.use('/admin', express.static(path.join(__dirname, 'admin')));

  // 网页版静态文件（放在 API 路由之后，避免拦截 /api）
  app.use('/', express.static(path.join(__dirname, 'gansu-web')));

  // 网页版 SPA fallback（非 /api 路径返回 index.html）
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ code: 404, message: 'Not Found' });
    res.sendFile(path.join(__dirname, 'gansu-web', 'index.html'));
  });

  // ════════════════════════════════════════════════════════
  // 全局错误处理 (隐藏内部错误细节)
  // ════════════════════════════════════════════════════════
  app.use((err, req, res, next) => {
    console.error(err.stack || err.message);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
};

startServer().catch(err => {
  console.error('服务器启动失败:', err);
  process.exit(1);
});
