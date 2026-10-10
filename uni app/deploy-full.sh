#!/bin/bash
echo "=== 甘肃文化小程序后端完整部署 ==="

echo ""
echo "1. 创建项目目录"
mkdir -p /home/ubuntu/gansu-culture-api
cd /home/ubuntu/gansu-culture-api

echo ""
echo "2. 创建 package.json"
cat > package.json << 'EOF'
{
  "name": "gansu-culture-api",
  "version": "1.0.0",
  "description": "甘肃文化小程序后端 API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "init": "node initData.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.3.4",
    "multer": "^1.4.5-lts.1",
    "qiniu": "^7.12.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
EOF

echo ""
echo "3. 创建 .env 文件"
cat > .env << 'EOF'
PORT=3000
MONGO_URI=mongodb://localhost:27017/gansu_culture
JWT_SECRET=your_jwt_secret_key_here_change_it
QINIU_AK=QINIU_AK_PLACEHOLDER
QINIU_SK=QINIU_SK_PLACEHOLDER
QINIU_BUCKET=fy-overseas
QINIU_DOMAIN=http://gansu-culture.xyz
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
USE_MEMORY_DB=false
EOF

echo ""
echo "4. 创建配置目录和文件"
mkdir -p config
cat > config/db.js << 'EOF'
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
EOF

cat > config/jwt.js << 'EOF'
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
EOF

cat > config/qiniu.js << 'EOF'
const qiniu = require('qiniu');

const qiniuConfig = {
  accessKey: process.env.QINIU_AK,
  secretKey: process.env.QINIU_SK,
  bucket: process.env.QINIU_BUCKET,
  domain: process.env.QINIU_DOMAIN
};

const mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey);
const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_as0;

const bucketManager = new qiniu.rs.BucketManager(mac, config);

const getUploadToken = () => {
  const options = {
    scope: qiniuConfig.bucket,
    expires: 3600
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  return putPolicy.uploadToken(mac);
};

module.exports = {
  ...qiniuConfig,
  getUploadToken,
  bucketManager
};
EOF

echo ""
echo "5. 创建工具目录和文件"
mkdir -p utils
cat > utils/response.js << 'EOF'
const success = (data = null, message = '操作成功') => {
  return {
    code: 200,
    message,
    data
  };
};

const error = (message = '操作失败', code = 500) => {
  return {
    code,
    message
  };
};

const unauthorized = (message = '未授权') => {
  return {
    code: 401,
    message
  };
};

const pagination = (list, total, page, pageSize) => {
  return {
    list,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
};

module.exports = { success, error, unauthorized, pagination };
EOF

echo ""
echo "6. 创建中间件目录和文件"
mkdir -p middleware
cat > middleware/auth.js << 'EOF'
const { verifyToken } = require('../config/jwt');
const { unauthorized } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json(unauthorized('请先登录'));
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json(unauthorized('Token无效'));
  }
  
  req.user = decoded;
  next();
};

module.exports = authMiddleware;
EOF

echo ""
echo "7. 创建模型目录和文件"
mkdir -p models
cat > models/Admin.js << 'EOF'
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema);
EOF

cat > models/Banner.js << 'EOF'
const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String },
  link: { type: String },
  sort: { type: Number, default: 0 },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Banner', BannerSchema);
EOF

cat > models/City.js << 'EOF'
const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String },
  attractions: { type: Number, default: 0 },
  foods: { type: Number, default: 0 },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('City', CitySchema);
EOF

cat > models/Culture.js << 'EOF'
const mongoose = require('mongoose');

const CultureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  type: { type: String, default: '非遗' },
  region: { type: String },
  level: { type: String },
  description: { type: String },
  details: { type: String },
  status: { type: Number, default: 1 },
  isHot: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Culture', CultureSchema);
EOF

cat > models/Event.js << 'EOF'
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  date: { type: String, required: true },
  location: { type: String },
  description: { type: String },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
EOF

cat > models/Food.js << 'EOF'
const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 0 },
  location: { type: String },
  tags: { type: Array, default: [] },
  description: { type: String },
  details: { type: String },
  status: { type: Number, default: 1 },
  isHot: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Food', FoodSchema);
EOF

cat > models/QuickEntry.js << 'EOF'
const mongoose = require('mongoose');

const QuickEntrySchema = new mongoose.Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  path: { type: String },
  sort: { type: Number, default: 0 },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuickEntry', QuickEntrySchema);
EOF

cat > models/Spot.js << 'EOF'
const mongoose = require('mongoose');

const SpotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 0 },
  location: { type: String },
  tags: { type: Array, default: [] },
  description: { type: String },
  details: { type: String },
  status: { type: Number, default: 1 },
  isHot: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Spot', SpotSchema);
EOF

echo ""
echo "8. 创建路由目录和文件"
mkdir -p routes
cat > routes/auth.js << 'EOF'
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { generateToken } = require('../config/jwt');
const { success, error } = require('../utils/response');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(400).json(error('用户名或密码错误'));
    }
    
    const isMatch = await admin.matchPassword(password);
    
    if (!isMatch) {
      return res.status(400).json(error('用户名或密码错误'));
    }
    
    const token = generateToken(admin._id);
    
    res.json(success({ token, username: admin.username }));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF

cat > routes/home.js << 'EOF'
const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const QuickEntry = require('../models/QuickEntry');
const Culture = require('../models/Culture');
const Spot = require('../models/Spot');
const Food = require('../models/Food');
const Event = require('../models/Event');
const { success } = require('../utils/response');

router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ status: 1 }).sort({ sort: 1 });
    const quickEntries = await QuickEntry.find({ status: 1 }).sort({ sort: 1 });
    const hotCultures = await Culture.find({ status: 1, isHot: true }).limit(4);
    const hotSpots = await Spot.find({ status: 1, isHot: true }).limit(4);
    const hotFoods = await Food.find({ status: 1, isHot: true }).limit(4);
    const events = await Event.find({ status: 1 }).sort({ date: 1 }).limit(5);
    
    res.json(success({
      banners,
      quickEntries,
      hotCultures,
      hotSpots,
      hotFoods,
      events
    }));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;
EOF

cat > routes/banners.js << 'EOF'
const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { success, error } = require('../utils/response');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ status: 1 }).sort({ sort: 1 });
    res.json(success(banners));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json(error('轮播图不存在'));
    res.json(success(banner));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.json(success(banner, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json(error('轮播图不存在'));
    res.json(success(banner, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json(error('轮播图不存在'));
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF

cat > routes/cities.js << 'EOF'
const express = require('express');
const router = express.Router();
const City = require('../models/City');
const { success, error } = require('../utils/response');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const cities = await City.find({ status: 1 });
    res.json(success(cities));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:name', async (req, res) => {
  try {
    const city = await City.findOne({ name: req.params.name });
    if (!city) return res.status(404).json(error('城市不存在'));
    res.json(success(city));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const city = await City.create(req.body);
    res.json(success(city, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!city) return res.status(404).json(error('城市不存在'));
    res.json(success(city, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) return res.status(404).json(error('城市不存在'));
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF

cat > routes/cultures.js << 'EOF'
const express = require('express');
const router = express.Router();
const Culture = require('../models/Culture');
const { success, error, pagination } = require('../utils/response');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    
    const total = await Culture.countDocuments({ status: 1 });
    const cultures = await Culture.find({ status: 1 })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    
    res.json(success(pagination(cultures, total, page, pageSize)));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const culture = await Culture.findById(req.params.id);
    if (!culture) return res.status(404).json(error('非遗不存在'));
    res.json(success(culture));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const culture = await Culture.create(req.body);
    res.json(success(culture, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const culture = await Culture.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!culture) return res.status(404).json(error('非遗不存在'));
    res.json(success(culture, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const culture = await Culture.findByIdAndDelete(req.params.id);
    if (!culture) return res.status(404).json(error('非遗不存在'));
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF

cat > routes/events.js << 'EOF'
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { success, error } = require('../utils/response');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ status: 1 }).sort({ date: 1 });
    res.json(success(events));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json(error('活动不存在'));
    res.json(success(event));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.json(success(event, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json(error('活动不存在'));
    res.json(success(event, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json(error('活动不存在'));
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF

cat > routes/foods.js << 'EOF'
const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const { success, error, pagination } = require('../utils/response');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    
    const total = await Food.countDocuments({ status: 1 });
    const foods = await Food.find({ status: 1 })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    
    res.json(success(pagination(foods, total, page, pageSize)));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json(error('美食不存在'));
    res.json(success(food));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.json(success(food, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!food) return res.status(404).json(error('美食不存在'));
    res.json(success(food, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json(error('美食不存在'));
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF

cat > routes/quick-entries.js << 'EOF'
const express = require('express');
const router = express.Router();
const QuickEntry = require('../models/QuickEntry');
const { success, error } = require('../utils/response');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const entries = await QuickEntry.find({ status: 1 }).sort({ sort: 1 });
    res.json(success(entries));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const entry = await QuickEntry.findById(req.params.id);
    if (!entry) return res.status(404).json(error('入口不存在'));
    res.json(success(entry));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const entry = await QuickEntry.create(req.body);
    res.json(success(entry, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await QuickEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!entry) return res.status(404).json(error('入口不存在'));
    res.json(success(entry, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await QuickEntry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json(error('入口不存在'));
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF

cat > routes/spots.js << 'EOF'
const express = require('express');
const router = express.Router();
const Spot = require('../models/Spot');
const { success, error, pagination } = require('../utils/response');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    
    const total = await Spot.countDocuments({ status: 1 });
    const spots = await Spot.find({ status: 1 })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    
    res.json(success(pagination(spots, total, page, pageSize)));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) return res.status(404).json(error('景点不存在'));
    res.json(success(spot));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const spot = await Spot.create(req.body);
    res.json(success(spot, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const spot = await Spot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!spot) return res.status(404).json(error('景点不存在'));
    res.json(success(spot, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const spot = await Spot.findByIdAndDelete(req.params.id);
    if (!spot) return res.status(404).json(error('景点不存在'));
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF

echo ""
echo "9. 创建服务器入口文件"
cat > server.js << 'EOF'
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const bannerRoutes = require('./routes/banners');
const quickEntryRoutes = require('./routes/quick-entries');
const cultureRoutes = require('./routes/cultures');
const spotRoutes = require('./routes/spots');
const foodRoutes = require('./routes/foods');
const eventRoutes = require('./routes/events');
const cityRoutes = require('./routes/cities');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/quick-entries', quickEntryRoutes);
app.use('/api/cultures', cultureRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/cities', cityRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
EOF

echo ""
echo "10. 创建初始化数据脚本"
cat > initData.js << 'EOF'
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const Banner = require('./models/Banner');
const QuickEntry = require('./models/QuickEntry');
const Culture = require('./models/Culture');
const Spot = require('./models/Spot');
const Food = require('./models/Food');
const Event = require('./models/Event');
const City = require('./models/City');

const qiniuDomain = process.env.QINIU_DOMAIN;

const initData = async () => {
  try {
    await connectDB();
    
    await Admin.deleteMany({});
    await Admin.create({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD
    });
    console.log('管理员账号初始化完成');
    
    await Banner.deleteMany({});
    await Banner.create([
      { image: `${qiniuDomain}/banner1.jpg`, title: '甘肃非遗文化', link: '/pages/culture-list/culture-list', sort: 1 },
      { image: `${qiniuDomain}/banner2.jpg`, title: '丝路风情', link: '/pages/spot-list/spot-list', sort: 2 },
      { image: `${qiniuDomain}/banner3.jpg`, title: '西北美食', link: '/pages/food-list/food-list', sort: 3 }
    ]);
    console.log('轮播图数据初始化完成');
    
    await QuickEntry.deleteMany({});
    await QuickEntry.create([
      { icon: '🏮', title: '非遗文化', path: '/pages/culture-list/culture-list', sort: 1 },
      { icon: '🏔️', title: '景点推荐', path: '/pages/spot-list/spot-list', sort: 2 },
      { icon: '🍜', title: '美食推荐', path: '/pages/food-list/food-list', sort: 3 },
      { icon: '📅', title: '近期活动', path: '/pages/index/index', sort: 4 },
      { icon: '📍', title: '城市地图', path: '/pages/index/index', sort: 5 },
      { icon: '⭐', title: '我的收藏', path: '/pages/index/index', sort: 6 }
    ]);
    console.log('快捷入口数据初始化完成');
    
    await Culture.deleteMany({});
    await Culture.create([
      {
        name: '敦煌莫高窟',
        image: `${qiniuDomain}/culture1.jpg`,
        type: '世界文化遗产',
        region: '酒泉市',
        level: '国家级',
        description: '世界上现存规模最大、内容最丰富的佛教艺术地',
        details: '敦煌莫高窟，俗称千佛洞，坐落在河西走廊西端的敦煌。它始建于十六国的前秦时期，历经十六国、北朝、隋、唐、五代、西夏、元等历代的兴建，形成巨大的规模，有洞窟735个，壁画4.5万平方米、泥质彩塑2415尊，是世界上现存规模最大、内容最丰富的佛教艺术地。',
        isHot: true
      },
      {
        name: '嘉峪关关城',
        image: `${qiniuDomain}/culture2.jpg`,
        type: '世界文化遗产',
        region: '嘉峪关市',
        level: '国家级',
        description: '天下第一雄关，明代万里长城的西端起点',
        details: '嘉峪关关城位于嘉峪关市西5公里处最狭窄的山谷中部，城关两侧的城墙横穿沙漠戈壁，北连黑山悬壁长城，南接天下第一墩，是明代万里长城最西端的关口，历史上曾被称为河西咽喉，因地势险要，建筑雄伟，有天下第一雄关、连陲锁钥之称。',
        isHot: true
      },
      {
        name: '麦积山石窟',
        image: `${qiniuDomain}/culture3.jpg`,
        type: '世界文化遗产',
        region: '天水市',
        level: '国家级',
        description: '东方雕塑艺术陈列馆',
        details: '麦积山石窟位于甘肃省天水市麦积区，是中国四大石窟之一。麦积山石窟始建于384-417年，存有221座洞窟、10632身泥塑石雕、1300余平方米壁画，以其精美的泥塑艺术闻名世界，被誉为东方雕塑艺术陈列馆。',
        isHot: true
      },
      {
        name: '兰州太平鼓',
        image: `${qiniuDomain}/culture4.jpg`,
        type: '国家级非物质文化遗产',
        region: '兰州市',
        level: '国家级',
        description: '兰州地区传统民俗鼓舞',
        details: '兰州太平鼓是一种具有600多年历史的传统鼓舞。太平鼓作为兰州地区独特的民间艺术，每逢大的庆典活动，太平鼓表演都是整个活动的高潮部分，那铿锵有力的鼓声，显示了黄河之滨人民的英雄气魄，其风格独特，具有浓厚的西北特色和艺术魄力。',
        isHot: true
      },
      {
        name: '花儿',
        image: `${qiniuDomain}/culture5.jpg`,
        type: '人类非物质文化遗产',
        region: '甘肃各地',
        level: '世界级',
        description: '甘肃民间流行的一种歌曲',
        details: '花儿是流行于甘肃、青海、宁夏等广大地区的一种山歌，是当地人民口头文学形式之一。花儿结构分两段，前段比兴、后段是歌唱的主题内容。曲调具有浓郁的乡土气息和民族风格，深受当地群众的喜爱。',
        isHot: false
      },
      {
        name: '庆阳剪纸',
        image: `${qiniuDomain}/culture6.jpg`,
        type: '国家级非物质文化遗产',
        region: '庆阳市',
        level: '国家级',
        description: '中国民间剪纸艺术之乡',
        details: '庆阳剪纸历史悠久，种类繁多，用途广泛。剪纸内容丰富，有花鸟虫鱼、飞禽走兽、人物故事等。剪纸风格粗犷豪放，简洁明快，线条流畅，具有独特的艺术魅力。',
        isHot: false
      }
    ]);
    console.log('非遗文化数据初始化完成');
    
    await Spot.deleteMany({});
    await Spot.create([
      {
        name: '鸣沙山月牙泉',
        image: `${qiniuDomain}/spot1.jpg`,
        rating: 4.9,
        location: '敦煌市',
        tags: ['沙漠', '泉水', '自然奇观'],
        description: '沙漠中的奇迹，沙泉共生的独特景观',
        details: '鸣沙山月牙泉位于敦煌市城南5公里处，以"山泉共处，沙水共生"的奇妙景观著称于世，被誉为"塞外风光之一绝"。鸣沙山因沙动成响而得名，月牙泉因形似一弯新月而得名。',
        isHot: true
      },
      {
        name: '张掖七彩丹霞',
        image: `${qiniuDomain}/spot2.jpg`,
        rating: 4.8,
        location: '张掖市',
        tags: ['丹霞地貌', '自然景观', '摄影胜地'],
        description: '中国最美的丹霞地貌之一',
        details: '张掖七彩丹霞地貌群位于甘肃省张掖市临泽县倪家营乡南台村，平均海拔1850米，东西长约45公里，南北宽约10公里。该地貌群以其面积大、集中，层理交错、岩壁陡峭、气势磅礴、造型奇特、色彩斑斓而称奇。',
        isHot: true
      },
      {
        name: '青海湖',
        image: `${qiniuDomain}/spot3.jpg`,
        rating: 4.9,
        location: '青海湖',
        tags: ['湖泊', '自然景观', '避暑胜地'],
        description: '中国最大的内陆湖',
        details: '青海湖位于青藏高原东北部、青海省境内，是中国最大的内陆湖、咸水湖。青海湖由祁连山脉的大通山、日月山与青海南山之间的断层陷落形成。',
        isHot: true
      },
      {
        name: '拉卜楞寺',
        image: `${qiniuDomain}/spot4.jpg`,
        rating: 4.7,
        location: '甘南州',
        tags: ['佛教', '寺院', '文化遗产'],
        description: '世界藏学府',
        details: '拉卜楞寺位于甘肃省甘南藏族自治州夏河县，是藏传佛教格鲁派六大寺院之一，被誉为"世界藏学府"。拉卜楞寺拥有世界上最长的转经筒长廊，共有1700多个转经筒。',
        isHot: true
      },
      {
        name: '祁连山',
        image: `${qiniuDomain}/spot5.jpg`,
        rating: 4.8,
        location: '张掖市',
        tags: ['山脉', '自然景观', '避暑胜地'],
        description: '中国西部重要的生态屏障',
        details: '祁连山位于中国青海省东北部与甘肃省西部边境，是中国境内主要山脉之一。祁连山素有"万宝山"之称，蕴藏着种类繁多、品质优良的矿藏，有石棉矿，黄铁矿、铬铁矿及铜、铅、锌等多种矿产。',
        isHot: false
      },
      {
        name: '崆峒山',
        image: `${qiniuDomain}/spot6.jpg`,
        rating: 4.6,
        location: '平凉市',
        tags: ['道教', '名山', '自然景观'],
        description: '天下道教第一山',
        details: '崆峒山位于甘肃省平凉市崆峒区，是丝绸之路西出关中之要塞。自古就有"中华道教第一山"之美誉。崆峒山海拔高度在1456-2123.5米之间，垂直高度为667.5米，主峰海拔2123米，森林覆盖率达95%以上。',
        isHot: false
      }
    ]);
    console.log('景点数据初始化完成');
    
    await Food.deleteMany({});
    await Food.create([
      {
        name: '兰州牛肉面',
        image: `${qiniuDomain}/food1.jpg`,
        rating: 4.9,
        location: '兰州市',
        tags: ['面食', '特色小吃', '必吃'],
        description: '中华第一面，兰州的城市名片',
        details: '兰州牛肉面，又称兰州清汤牛肉面，是甘肃省兰州市的一种风味美食，以"汤镜者清，肉烂者香，面细者精"的独特风味和"一清二白三红四绿五黄"的色泽搭配赢得了国内乃至全世界顾客的好评。',
        isHot: true
      },
      {
        name: '羊肉泡馍',
        image: `${qiniuDomain}/food2.jpg`,
        rating: 4.8,
        location: '陇东地区',
        tags: ['主食', '羊肉', '传统美食'],
        description: '西北传统美食，暖胃暖心',
        details: '羊肉泡馍是西北著名的传统美食，尤以甘肃、陕西为盛。羊肉泡馍的制作讲究，馍要煮得软烂，汤要浓郁，肉要鲜嫩，是一道营养丰富、味道鲜美的传统美食。',
        isHot: true
      },
      {
        name: '手抓羊肉',
        image: `${qiniuDomain}/food3.jpg`,
        rating: 4.9,
        location: '临夏州',
        tags: ['羊肉', '特色菜', '必吃'],
        description: '西北风味，肉质鲜嫩',
        details: '手抓羊肉是西北各民族喜爱的传统名吃。其特点是肉味鲜美，不膻不腻，营养丰富。制作时选用膘肥肉嫩的羊，宰杀后去毛去内脏，整只下锅煮，煮好后捞出，切成大块，用手抓着吃。',
        isHot: true
      },
      {
        name: '酿皮子',
        image: `${qiniuDomain}/food4.jpg`,
        rating: 4.7,
        location: '甘肃各地',
        tags: ['小吃', '面食', '夏季必备'],
        description: '西北特色小吃，凉爽可口',
        details: '酿皮子是西北特色小吃之一，以其色泽黄亮、条干柔韧、配料独特、酸辣爽口而著称。酿皮子是用面粉加水调成糊状，蒸熟后切成条状，加上辣椒油、醋、蒜汁、芥末等调料拌匀食用。',
        isHot: true
      },
      {
        name: '浆水面',
        image: `${qiniuDomain}/food5.jpg`,
        rating: 4.6,
        location: '陇东地区',
        tags: ['面食', '特色小吃', '夏季必备'],
        description: '消暑解渴的传统美食',
        details: '浆水面是甘肃陇东地区的传统美食，以其酸香爽口、消暑解渴而深受人们喜爱。浆水面的制作讲究，浆水要发酵得恰到好处，面条要筋道，加上葱花、香菜等调料，味道鲜美。',
        isHot: false
      },
      {
        name: '灰豆子',
        image: `${qiniuDomain}/food6.jpg`,
        rating: 4.7,
        location: '兰州市',
        tags: ['小吃', '甜品', '传统美食'],
        description: '兰州特色小吃，营养丰富',
        details: '灰豆子是兰州特有的一种小吃，以麻色豌豆为主料，配以红枣、白糖等，熬煮而成。灰豆子口感软糯，味道香甜，营养丰富，是兰州人喜爱的传统小吃。',
        isHot: false
      }
    ]);
    console.log('美食数据初始化完成');
    
    await Event.deleteMany({});
    await Event.create([
      {
        title: '敦煌文化旅游节',
        image: `${qiniuDomain}/event1.jpg`,
        date: '2026-08-15',
        location: '敦煌市',
        description: '展示敦煌文化魅力，促进文化交流'
      },
      {
        title: '张掖丹霞摄影节',
        image: `${qiniuDomain}/event2.jpg`,
        date: '2026-09-01',
        location: '张掖市',
        description: '摄影爱好者的盛会，记录丹霞美景'
      },
      {
        title: '兰州马拉松',
        image: `${qiniuDomain}/event3.jpg`,
        date: '2026-09-15',
        location: '兰州市',
        description: '全民参与的体育盛会'
      },
      {
        title: '天水伏羲文化节',
        image: `${qiniuDomain}/event4.jpg`,
        date: '2026-10-01',
        location: '天水市',
        description: '纪念人文始祖伏羲，弘扬传统文化'
      },
      {
        title: '甘南香巴拉旅游节',
        image: `${qiniuDomain}/event5.jpg`,
        date: '2026-10-15',
        location: '甘南州',
        description: '感受藏族文化，体验草原风情'
      }
    ]);
    console.log('活动数据初始化完成');
    
    await City.deleteMany({});
    await City.create([
      { name: '兰州', image: `${qiniuDomain}/city1.jpg`, description: '甘肃省省会', attractions: 20, foods: 15 },
      { name: '敦煌', image: `${qiniuDomain}/city2.jpg`, description: '世界文化遗产所在地', attractions: 15, foods: 10 },
      { name: '张掖', image: `${qiniuDomain}/city3.jpg`, description: '丝路重镇', attractions: 12, foods: 8 },
      { name: '天水', image: `${qiniuDomain}/city4.jpg`, description: '羲皇故里', attractions: 10, foods: 12 },
      { name: '嘉峪关', image: `${qiniuDomain}/city5.jpg`, description: '天下第一雄关', attractions: 8, foods: 6 },
      { name: '甘南', image: `${qiniuDomain}/city6.jpg`, description: '藏族风情', attractions: 15, foods: 10 }
    ]);
    console.log('城市数据初始化完成');
    
    console.log('');
    console.log('=== 所有数据初始化完成 ===');
    process.exit(0);
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  }
};

initData();
EOF

echo ""
echo "11. 安装依赖"
npm install

echo ""
echo "12. 安装 PM2"
npm install -g pm2

echo ""
echo "13. 初始化数据"
node initData.js

echo ""
echo "14. 启动服务"
pm2 start server.js --name gansu-culture-api

echo ""
echo "15. 检查状态"
pm2 status

echo ""
echo "=== 部署完成 ==="
