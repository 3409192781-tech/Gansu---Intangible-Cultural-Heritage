# 云游甘肃后端部署指南

## 📋 服务器信息

| 项目 | 内容 |
|------|------|
| IP地址 | YOUR_SERVER_IP |
| 用户名 | ubuntu |
| 密码 | txymjx20060814.. |

## 🚀 部署步骤

### 第一步：登录服务器

登录腾讯云控制台 → 轻量应用服务器 → 点击「登录」→ 输入密码

### 第二步：执行部署命令

#### 1. 创建项目目录

```bash
mkdir -p /home/ubuntu/gansu-backend && cd /home/ubuntu/gansu-backend
```

#### 2. 更新系统包

```bash
sudo apt update -y
```

#### 3. 安装 Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 4. 安装 MongoDB

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update -y
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 5. 创建项目文件

创建 package.json：
```bash
cat > package.json << 'EOF'
{
  "name": "gansu-backend",
  "version": "1.0.0",
  "description": "云游甘肃小程序后端服务",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "init": "node data/initData.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.2.0",
    "multer": "^1.4.5-lts.1",
    "qiniu": "^7.10.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
EOF
```

#### 6. 创建环境变量

```bash
cat > .env << 'EOF'
PORT=3000
MONGO_URI=mongodb://localhost:27017/gansu_culture
USE_MEMORY_DB=false
JWT_SECRET=JWT_SECRET_PLACEHOLDER
JWT_EXPIRE=7d
QINIU_AK=QINIU_AK_PLACEHOLDER
QINIU_SK=QINIU_SK_PLACEHOLDER
QINIU_BUCKET=fy-overseas
QINIU_DOMAIN=https://gansu-culture.xyz
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EOF
```

#### 7. 创建目录结构

```bash
mkdir -p config middleware models routes utils data
```

#### 8. 创建配置文件

创建 config/db.js：
```bash
cat > config/db.js << 'EOF'
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB连接成功: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB连接失败:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
EOF
```

创建 config/jwt.js：
```bash
cat > config/jwt.js << 'EOF'
module.exports = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRE,
};
EOF
```

创建 config/qiniu.js：
```bash
cat > config/qiniu.js << 'EOF'
const qiniu = require('qiniu');

const mac = new qiniu.auth.digest.Mac(
  process.env.QINIU_AK,
  process.env.QINIU_SK
);

const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_as0;
config.useHttpsDomain = true;

const bucketManager = new qiniu.rs.BucketManager(mac, config);

const uploadToken = (bucket, key) => {
  const options = {
    scope: bucket + ':' + key,
    expires: 3600
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  return putPolicy.uploadToken(mac);
};

module.exports = {
  mac,
  config,
  bucketManager,
  uploadToken,
  bucket: process.env.QINIU_BUCKET,
  domain: process.env.QINIU_DOMAIN
};
EOF
```

#### 9. 创建工具函数

```bash
cat > utils/response.js << 'EOF'
const success = (data, message = '操作成功') => ({
  code: 200,
  message,
  data,
});

const error = (message = '操作失败') => ({
  code: 500,
  message,
  data: null,
});

const unauthorized = (message = '未授权') => ({
  code: 401,
  message,
  data: null,
});

const paginate = (list, total, page, pageSize) => ({
  list,
  total,
  page,
  pageSize,
  totalPages: Math.ceil(total / pageSize),
});

module.exports = {
  success,
  error,
  unauthorized,
  paginate,
};
EOF
```

#### 10. 创建认证中间件

```bash
cat > middleware/auth.js << 'EOF'
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { unauthorized } = require('../utils/response');

const protect = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json(unauthorized('请先登录'));
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json(unauthorized('token无效'));
  }
};

module.exports = { protect };
EOF
```

#### 11. 创建数据模型

创建 models/Admin.js：
```bash
cat > models/Admin.js << 'EOF'
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('Admin', AdminSchema);
EOF
```

创建 models/Banner.js：
```bash
cat > models/Banner.js << 'EOF'
const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String },
  linkType: { type: String, default: 'page' },
  linkValue: { type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Banner', BannerSchema);
EOF
```

创建 models/City.js：
```bash
cat > models/City.js << 'EOF'
const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String },
  banner: { type: String },
  level: { type: String, default: '省级' },
  years: { type: String },
  intro: { type: String },
  heritages: [{
    id: String,
    name: String,
    image: String,
    desc: String,
    tags: [String],
    level: String
  }],
  spots: [String],
  foods: [String],
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('City', CitySchema);
EOF
```

创建 models/Culture.js：
```bash
cat > models/Culture.js << 'EOF'
const mongoose = require('mongoose');

const CultureSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  tags: [String],
  location: { type: String },
  rating: { type: String },
  reviews: { type: String },
  level: { type: String, default: '国家级' },
  sortOrder: { type: Number, default: 0 },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Culture', CultureSchema);
EOF
```

创建 models/Event.js：
```bash
cat > models/Event.js << 'EOF'
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  month: { type: String, required: true },
  day: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String },
  date: { type: Date },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
EOF
```

创建 models/Food.js：
```bash
cat > models/Food.js << 'EOF'
const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  tags: [String],
  location: { type: String },
  rating: { type: String },
  reviews: { type: String },
  type: { type: String },
  area: { type: String },
  isHot: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Food', FoodSchema);
EOF
```

创建 models/QuickEntry.js：
```bash
cat > models/QuickEntry.js << 'EOF'
const mongoose = require('mongoose');

const QuickEntrySchema = new mongoose.Schema({
  icon: { type: String, required: true },
  text: { type: String, required: true },
  linkType: { type: String, default: 'page' },
  linkValue: { type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuickEntry', QuickEntrySchema);
EOF
```

创建 models/Spot.js：
```bash
cat > models/Spot.js << 'EOF'
const mongoose = require('mongoose');

const SpotSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  tags: [String],
  location: { type: String },
  rating: { type: String },
  reviews: { type: String },
  type: { type: String },
  area: { type: String },
  isHot: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Spot', SpotSchema);
EOF
```

#### 12. 创建路由接口

创建 routes/auth.js：
```bash
cat > routes/auth.js << 'EOF'
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const jwtConfig = require('../config/jwt');
const { success, error, unauthorized } = require('../utils/response');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json(unauthorized('用户名或密码错误'));
    
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json(unauthorized('用户名或密码错误'));
    
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );
    
    res.json(success({ token, username: admin.username, id: admin._id }, '登录成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF
```

创建 routes/home.js：
```bash
cat > routes/home.js << 'EOF'
const express = require('express');
const Banner = require('../models/Banner');
const QuickEntry = require('../models/QuickEntry');
const Spot = require('../models/Spot');
const Culture = require('../models/Culture');
const Food = require('../models/Food');
const Event = require('../models/Event');
const { success } = require('../utils/response');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ status: 1 }).sort({ sortOrder: 1 });
    const quickEntries = await QuickEntry.find({ status: 1 }).sort({ sortOrder: 1 });
    const hotSpots = await Spot.find({ status: 1, isHot: true }).sort({ sortOrder: 1 });
    const hotCultures = await Culture.find({ status: 1 }).sort({ sortOrder: 1 }).limit(6);
    const hotFoods = await Food.find({ status: 1, isHot: true }).sort({ sortOrder: 1 });
    const events = await Event.find({ status: 1 }).sort({ date: 1 });
    
    res.json(success({
      banners,
      quickEntries,
      hotSpots,
      hotCultures,
      hotFoods,
      events,
      updateTime: new Date()
    }));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;
EOF
```

创建 routes/cultures.js：
```bash
cat > routes/cultures.js << 'EOF'
const express = require('express');
const Culture = require('../models/Culture');
const { success, error, paginate } = require('../utils/response');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    
    const list = await Culture.find({ status: 1 }).sort({ sortOrder: 1 }).skip(skip).limit(pageSize);
    const total = await Culture.countDocuments({ status: 1 });
    
    res.json(success(paginate(list, total, page, pageSize)));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const culture = await Culture.findOne({ id: req.params.id, status: 1 });
    if (!culture) return res.status(404).json(error('记录不存在'));
    res.json(success(culture));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const culture = await Culture.create(req.body);
    res.json(success(culture, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const culture = await Culture.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(success(culture, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Culture.findByIdAndUpdate(req.params.id, { status: 0 });
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF
```

创建 routes/spots.js：
```bash
cat > routes/spots.js << 'EOF'
const express = require('express');
const Spot = require('../models/Spot');
const { success, error, paginate } = require('../utils/response');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    
    const list = await Spot.find({ status: 1 }).sort({ sortOrder: 1 }).skip(skip).limit(pageSize);
    const total = await Spot.countDocuments({ status: 1 });
    
    res.json(success(paginate(list, total, page, pageSize)));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const spot = await Spot.findOne({ id: req.params.id, status: 1 });
    if (!spot) return res.status(404).json(error('记录不存在'));
    res.json(success(spot));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const spot = await Spot.create(req.body);
    res.json(success(spot, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const spot = await Spot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(success(spot, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Spot.findByIdAndUpdate(req.params.id, { status: 0 });
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF
```

创建 routes/foods.js：
```bash
cat > routes/foods.js << 'EOF'
const express = require('express');
const Food = require('../models/Food');
const { success, error, paginate } = require('../utils/response');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    
    const list = await Food.find({ status: 1 }).sort({ sortOrder: 1 }).skip(skip).limit(pageSize);
    const total = await Food.countDocuments({ status: 1 });
    
    res.json(success(paginate(list, total, page, pageSize)));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findOne({ id: req.params.id, status: 1 });
    if (!food) return res.status(404).json(error('记录不存在'));
    res.json(success(food));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.json(success(food, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(success(food, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Food.findByIdAndUpdate(req.params.id, { status: 0 });
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF
```

创建 routes/events.js：
```bash
cat > routes/events.js << 'EOF'
const express = require('express');
const Event = require('../models/Event');
const { success, error } = require('../utils/response');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await Event.find({ status: 1 }).sort({ date: 1 });
    res.json(success(list));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.json(success(event, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(success(event, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, { status: 0 });
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF
```

创建 routes/banners.js：
```bash
cat > routes/banners.js << 'EOF'
const express = require('express');
const Banner = require('../models/Banner');
const { success, error } = require('../utils/response');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await Banner.find({ status: 1 }).sort({ sortOrder: 1 });
    res.json(success(list));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.json(success(banner, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(success(banner, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Banner.findByIdAndUpdate(req.params.id, { status: 0 });
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF
```

创建 routes/quick-entries.js：
```bash
cat > routes/quick-entries.js << 'EOF'
const express = require('express');
const QuickEntry = require('../models/QuickEntry');
const { success, error } = require('../utils/response');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await QuickEntry.find({ status: 1 }).sort({ sortOrder: 1 });
    res.json(success(list));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const entry = await QuickEntry.create(req.body);
    res.json(success(entry, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const entry = await QuickEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(success(entry, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await QuickEntry.findByIdAndUpdate(req.params.id, { status: 0 });
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF
```

创建 routes/cities.js：
```bash
cat > routes/cities.js << 'EOF'
const express = require('express');
const City = require('../models/City');
const { success, error } = require('../utils/response');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await City.find({ status: 1 }).sort({ name: 1 });
    res.json(success(list));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:name', async (req, res) => {
  try {
    const city = await City.findOne({ name: req.params.name, status: 1 });
    if (!city) return res.status(404).json(error('城市不存在'));
    res.json(success(city));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const city = await City.create(req.body);
    res.json(success(city, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(success(city, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await City.findByIdAndUpdate(req.params.id, { status: 0 });
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
EOF
```

#### 13. 创建主服务器文件

```bash
cat > server.js << 'EOF'
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

const initData = async () => {
  const Admin = require('./models/Admin');
  const Banner = require('./models/Banner');
  const QuickEntry = require('./models/QuickEntry');
  const Spot = require('./models/Spot');
  const Culture = require('./models/Culture');
  const Food = require('./models/Food');
  const Event = require('./models/Event');
  const City = require('./models/City');

  await Admin.deleteMany({});
  await Banner.deleteMany({});
  await QuickEntry.deleteMany({});
  await Spot.deleteMany({});
  await Culture.deleteMany({});
  await Food.deleteMany({});
  await Event.deleteMany({});
  await City.deleteMany({});

  await Admin.create({
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  });

  await Banner.insertMany([
    { image: 'https://gansu-culture.xyz/spots/spot101-1.jpg', title: '莫高窟', desc: '世界文化遗产 · 千年艺术瑰宝', linkType: 'detail', linkValue: '101', sortOrder: 1 },
    { image: 'https://gansu-culture.xyz/spots/spot103-1.jpg', title: '麦积山石窟', desc: '东方雕塑艺术陈列馆', linkType: 'detail', linkValue: '103', sortOrder: 2 },
    { image: 'https://gansu-culture.xyz/spots/spot104-1.jpg', title: '嘉峪关关城', desc: '天下第一雄关 · 万里长城', linkType: 'detail', linkValue: '104', sortOrder: 3 }
  ]);

  await QuickEntry.insertMany([
    { icon: '/static/icons/map.svg', text: '地图导览', linkType: 'page', linkValue: '/pages/map/map', sortOrder: 1 },
    { icon: '/static/icons/spot.svg', text: '景点推荐', linkType: 'page', linkValue: '/pages/spot-list/spot-list', sortOrder: 2 },
    { icon: '/static/icons/culture.svg', text: '非遗文化', linkType: 'page', linkValue: '/pages/culture-list/culture-list', sortOrder: 3 },
    { icon: '/static/icons/food.svg', text: '特色美食', linkType: 'page', linkValue: '/pages/food-list/food-list', sortOrder: 4 },
    { icon: '/static/icons/ticket.svg', text: '门票预订', linkType: 'url', linkValue: '', sortOrder: 5 },
    { icon: '/static/icons/phone.svg', text: '联系我们', linkType: 'page', linkValue: '/pages/contact/contact', sortOrder: 6 }
  ]);

  await Spot.insertMany([
    { id: '101', name: '莫高窟', image: 'https://gansu-culture.xyz/spots/spot101-1.jpg', tags: ['世界文化遗产', '敦煌', '古代艺术'], location: '敦煌市', rating: '4.9', reviews: '12580', type: 'spot', area: '敦煌', isHot: true, sortOrder: 1 },
    { id: '102', name: '鸣沙山月牙泉', image: 'https://gansu-culture.xyz/spots/spot102-1.jpg', tags: ['沙漠奇观', '敦煌', '自然景观'], location: '敦煌市', rating: '4.8', reviews: '9870', type: 'spot', area: '敦煌', isHot: true, sortOrder: 2 },
    { id: '103', name: '麦积山石窟', image: 'https://gansu-culture.xyz/spots/spot103-1.jpg', tags: ['世界文化遗产', '天水', '雕塑艺术'], location: '天水市', rating: '4.7', reviews: '8650', type: 'spot', area: '天水', isHot: true, sortOrder: 3 },
    { id: '104', name: '嘉峪关关城', image: 'https://gansu-culture.xyz/spots/spot104-1.jpg', tags: ['万里长城', '嘉峪关', '历史古迹'], location: '嘉峪关市', rating: '4.6', reviews: '7430', type: 'spot', area: '嘉峪关', isHot: true, sortOrder: 4 },
    { id: '105', name: '张掖丹霞', image: 'https://gansu-culture.xyz/spots/spot105-1.jpg', tags: ['地质奇观', '张掖', '自然景观'], location: '张掖市', rating: '4.8', reviews: '11230', type: 'spot', area: '张掖', isHot: true, sortOrder: 5 }
  ]);

  await Culture.insertMany([
    { id: '1', name: '敦煌壁画', image: 'https://gansu-culture.xyz/details/detail1-1.jpg', tags: ['世界级非遗', '传统美术', '敦煌特色'], location: '敦煌市', rating: '4.9', reviews: '15680', level: '世界级', sortOrder: 1 },
    { id: '2', name: '花儿', image: 'https://gansu-culture.xyz/details/detail2-1.jpg', tags: ['世界级非遗', '传统音乐', '临夏特色'], location: '临夏市', rating: '4.8', reviews: '8920', level: '世界级', sortOrder: 2 },
    { id: '3', name: '敦煌彩塑', image: 'https://gansu-culture.xyz/details/detail3-1.jpg', tags: ['国家级非遗', '传统美术', '敦煌特色'], location: '敦煌市', rating: '4.9', reviews: '12350', level: '国家级', sortOrder: 3 },
    { id: '4', name: '兰州太平鼓', image: 'https://gansu-culture.xyz/details/detail4-1.jpg', tags: ['国家级非遗', '传统舞蹈', '兰州特色'], location: '兰州市', rating: '4.7', reviews: '6780', level: '国家级', sortOrder: 4 },
    { id: '5', name: '陇剧', image: 'https://gansu-culture.xyz/details/detail5-1.jpg', tags: ['国家级非遗', '传统戏剧', '甘肃特色'], location: '兰州市', rating: '4.6', reviews: '4520', level: '国家级', sortOrder: 5 },
    { id: '6', name: '藏族唐卡', image: 'https://gansu-culture.xyz/details/detail6-1.jpg', tags: ['国家级非遗', '传统美术', '甘南特色'], location: '甘南州', rating: '4.8', reviews: '7890', level: '国家级', sortOrder: 6 },
    { id: '7', name: '兰州牛肉面制作技艺', image: 'https://gansu-culture.xyz/details/detail7-1.jpg', tags: ['国家级非遗', '传统技艺', '兰州特色'], location: '兰州市', rating: '4.9', reviews: '23450', level: '国家级', sortOrder: 7 },
    { id: '8', name: '洮砚制作技艺', image: 'https://gansu-culture.xyz/details/detail8-1.jpg', tags: ['国家级非遗', '传统技艺', '定西特色'], location: '定西市', rating: '4.7', reviews: '3420', level: '国家级', sortOrder: 8 },
    { id: '9', name: '保安腰刀锻制技艺', image: 'https://gansu-culture.xyz/details/detail9-1.jpg', tags: ['国家级非遗', '传统技艺', '临夏特色'], location: '临夏州积石山县', rating: '4.6', reviews: '2890', level: '国家级', sortOrder: 9 },
    { id: '10', name: '裕固族服饰', image: 'https://gansu-culture.xyz/details/detail10-1.jpg', tags: ['国家级非遗', '民俗', '张掖特色'], location: '张掖市肃南县', rating: '4.5', reviews: '4120', level: '国家级', sortOrder: 10 },
    { id: '11', name: '东乡族擀毡技艺', image: 'https://gansu-culture.xyz/details/detail11-1.jpg', tags: ['国家级非遗', '传统技艺', '临夏特色'], location: '临夏州东乡县', rating: '4.4', reviews: '2150', level: '国家级', sortOrder: 11 },
    { id: '12', name: '太昊伏羲祭典', image: 'https://gansu-culture.xyz/details/detail12-1.jpg', tags: ['国家级非遗', '民俗', '天水特色'], location: '天水市', rating: '4.8', reviews: '5680', level: '国家级', sortOrder: 12 },
    { id: '13', name: '白马人面具舞', image: 'https://gansu-culture.xyz/details/detail13-1.jpg', tags: ['国家级非遗', '传统舞蹈', '陇南特色'], location: '陇南市文县', rating: '4.5', reviews: '3280', level: '国家级', sortOrder: 13 },
    { id: '14', name: '环县道情皮影戏', image: 'https://gansu-culture.xyz/details/detail14-1.jpg', tags: ['国家级非遗', '传统戏剧', '庆阳特色'], location: '庆阳市环县', rating: '4.6', reviews: '3560', level: '国家级', sortOrder: 14 },
    { id: '15', name: '凉州贤孝', image: 'https://gansu-culture.xyz/details/detail15-1.jpg', tags: ['国家级非遗', '传统曲艺', '武威特色'], location: '武威市凉州区', rating: '4.4', reviews: '2680', level: '国家级', sortOrder: 15 },
    { id: '16', name: '天祝土族安召舞', image: 'https://gansu-culture.xyz/details/detail16-1.jpg', tags: ['国家级非遗', '传统舞蹈', '武威特色'], location: '武威市天祝县', rating: '4.5', reviews: '2930', level: '国家级', sortOrder: 16 },
    { id: '17', name: '甘南藏族民歌', image: 'https://gansu-culture.xyz/details/detail17-1.jpg', tags: ['国家级非遗', '传统音乐', '甘南特色'], location: '甘南州', rating: '4.7', reviews: '3890', level: '国家级', sortOrder: 17 },
    { id: '18', name: '河州花儿', image: 'https://gansu-culture.xyz/details/detail18-1.jpg', tags: ['国家级非遗', '传统音乐', '临夏特色'], location: '临夏州', rating: '4.7', reviews: '4120', level: '国家级', sortOrder: 18 },
    { id: '19', name: '保安族腰刀', image: 'https://gansu-culture.xyz/details/detail19-1.jpg', tags: ['国家级非遗', '传统技艺', '临夏特色'], location: '临夏州积石山县', rating: '4.6', reviews: '2780', level: '国家级', sortOrder: 19 },
    { id: '20', name: '东乡族花儿', image: 'https://gansu-culture.xyz/details/detail20-1.jpg', tags: ['国家级非遗', '传统音乐', '临夏特色'], location: '临夏州东乡县', rating: '4.5', reviews: '3240', level: '国家级', sortOrder: 20 },
    { id: '21', name: '撒拉族花儿', image: 'https://gansu-culture.xyz/details/detail21-1.jpg', tags: ['国家级非遗', '传统音乐', '临夏特色'], location: '临夏州循化县', rating: '4.5', reviews: '3120', level: '国家级', sortOrder: 21 },
    { id: '22', name: '裕固族民歌', image: 'https://gansu-culture.xyz/details/detail22-1.jpg', tags: ['国家级非遗', '传统音乐', '张掖特色'], location: '张掖市肃南县', rating: '4.6', reviews: '3450', level: '国家级', sortOrder: 22 },
    { id: '23', name: '康巴舞', image: 'https://gansu-culture.xyz/details/detail23-1.jpg', tags: ['国家级非遗', '传统舞蹈', '甘南特色'], location: '甘南州', rating: '4.7', reviews: '4680', level: '国家级', sortOrder: 23 },
    { id: '24', name: '锅庄舞', image: 'https://gansu-culture.xyz/details/detail24-1.jpg', tags: ['国家级非遗', '传统舞蹈', '甘南特色'], location: '甘南州', rating: '4.8', reviews: '5120', level: '国家级', sortOrder: 24 },
    { id: '25', name: '格萨尔王传', image: 'https://gansu-culture.xyz/details/detail25-1.jpg', tags: ['国家级非遗', '民间文学', '甘南特色'], location: '甘南州', rating: '4.9', reviews: '6780', level: '国家级', sortOrder: 25 },
    { id: '26', name: '敦煌曲子戏', image: 'https://gansu-culture.xyz/details/detail26-1.jpg', tags: ['国家级非遗', '传统戏剧', '敦煌特色'], location: '敦煌市', rating: '4.5', reviews: '3890', level: '国家级', sortOrder: 26 },
    { id: '27', name: '凉州半台戏', image: 'https://gansu-culture.xyz/details/detail27-1.jpg', tags: ['省级非遗', '传统戏剧', '武威特色'], location: '武威市凉州区', rating: '4.3', reviews: '1890', level: '省级', sortOrder: 27 },
    { id: '28', name: '河西宝卷', image: 'https://gansu-culture.xyz/details/detail28-1.jpg', tags: ['国家级非遗', '民间文学', '张掖特色'], location: '张掖市', rating: '4.6', reviews: '2980', level: '国家级', sortOrder: 28 },
    { id: '29', name: '庆阳剪纸', image: 'https://gansu-culture.xyz/details/detail29-1.jpg', tags: ['国家级非遗', '传统美术', '庆阳特色'], location: '庆阳市', rating: '4.8', reviews: '4560', level: '国家级', sortOrder: 29 },
    { id: '30', name: '灵台皇甫谧针灸术', image: 'https://gansu-culture.xyz/details/detail30-1.jpg', tags: ['省级非遗', '传统医药', '平凉特色'], location: '平凉市灵台县', rating: '4.3', reviews: '1680', level: '省级', sortOrder: 30 },
    { id: '31', name: '崆峒武术', image: 'https://gansu-culture.xyz/details/detail31-1.jpg', tags: ['国家级非遗', '传统体育', '平凉特色'], location: '平凉市', rating: '4.7', reviews: '3890', level: '国家级', sortOrder: 31 },
    { id: '32', name: '陇南影子腔', image: 'https://gansu-culture.xyz/details/detail32-1.jpg', tags: ['省级非遗', '传统戏剧', '陇南特色'], location: '陇南市', rating: '4.2', reviews: '1450', level: '省级', sortOrder: 32 },
    { id: '33', name: '武都高山戏', image: 'https://gansu-culture.xyz/details/detail33-1.jpg', tags: ['国家级非遗', '传统戏剧', '陇南特色'], location: '陇南市武都区', rating: '4.5', reviews: '5680', level: '国家级', sortOrder: 33 },
    { id: '34', name: '宕昌傩舞', image: 'https://gansu-culture.xyz/details/detail34-1.jpg', tags: ['省级非遗', '传统舞蹈', '陇南特色'], location: '陇南市宕昌县', rating: '4.2', reviews: '1280', level: '省级', sortOrder: 34 },
    { id: '35', name: '西和乞巧节', image: 'https://gansu-culture.xyz/details/detail35-1.jpg', tags: ['国家级非遗', '民俗', '陇南特色'], location: '陇南市西和县', rating: '4.7', reviews: '4230', level: '国家级', sortOrder: 35 },
    { id: '36', name: '礼县春官歌', image: 'https://gansu-culture.xyz/details/detail36-1.jpg', tags: ['省级非遗', '传统曲艺', '陇南特色'], location: '陇南市礼县', rating: '4.1', reviews: '980', level: '省级', sortOrder: 36 },
    { id: '37', name: '太昊伏羲祭典', image: 'https://gansu-culture.xyz/details/detail37-1.jpg', tags: ['国家级非遗', '民俗', '天水特色'], location: '天水市', rating: '4.8', reviews: '6120', level: '国家级', sortOrder: 37 },
    { id: '38', name: '秦安小曲', image: 'https://gansu-culture.xyz/details/detail38-1.jpg', tags: ['省级非遗', '传统曲艺', '天水特色'], location: '天水市秦安县', rating: '4.2', reviews: '1350', level: '省级', sortOrder: 38 },
    { id: '39', name: '清水道教音乐', image: 'https://gansu-culture.xyz/details/detail39-1.jpg', tags: ['省级非遗', '传统音乐', '天水特色'], location: '天水市清水县', rating: '4.3', reviews: '1480', level: '省级', sortOrder: 39 },
    { id: '40', name: '武山旋鼓', image: 'https://gansu-culture.xyz/details/detail40-1.jpg', tags: ['国家级非遗', '传统舞蹈', '天水特色'], location: '天水市武山县', rating: '4.6', reviews: '3560', level: '国家级', sortOrder: 40 },
    { id: '41', name: '洮砚制作技艺', image: 'https://gansu-culture.xyz/details/detail41-1.jpg', tags: ['国家级非遗', '传统技艺', '定西特色'], location: '定西市', rating: '4.7', reviews: '2890', level: '国家级', sortOrder: 41 },
    { id: '42', name: '岷县花儿', image: 'https://gansu-culture.xyz/details/detail42-1.jpg', tags: ['国家级非遗', '传统音乐', '定西特色'], location: '定西市岷县', rating: '4.6', reviews: '3280', level: '国家级', sortOrder: 42 },
    { id: '43', name: '通渭小曲戏', image: 'https://gansu-culture.xyz/details/detail43-1.jpg', tags: ['省级非遗', '传统戏剧', '定西特色'], location: '定西市通渭县', rating: '4.2', reviews: '1120', level: '省级', sortOrder: 43 },
    { id: '44', name: '临洮花儿', image: 'https://gansu-culture.xyz/details/detail44-1.jpg', tags: ['省级非遗', '传统音乐', '定西特色'], location: '定西市临洮县', rating: '4.3', reviews: '1560', level: '省级', sortOrder: 44 },
    { id: '45', name: '兰州鼓子', image: 'https://gansu-culture.xyz/details/detail45-1.jpg', tags: ['国家级非遗', '传统曲艺', '兰州特色'], location: '兰州市', rating: '4.5', reviews: '2890', level: '国家级', sortOrder: 45 }
  ]);

  await Food.insertMany([
    { id: '201', name: '兰州牛肉面', image: 'https://gansu-culture.xyz/foods/food201-1.jpg', tags: ['百年传承', '中华名小吃'], location: '兰州市', rating: '4.9', reviews: '35680', type: 'food', area: '兰州', isHot: true, sortOrder: 1 },
    { id: '202', name: '手抓羊肉', image: 'https://gansu-culture.xyz/foods/food202-1.jpg', tags: ['东乡特产', '肉质鲜嫩'], location: '临夏州', rating: '4.8', reviews: '18920', type: 'food', area: '临夏', isHot: true, sortOrder: 2 },
    { id: '203', name: '敦煌驴肉黄面', image: 'https://gansu-culture.xyz/foods/food203-1.jpg', tags: ['敦煌特色', '筋道爽滑'], location: '敦煌市', rating: '4.7', reviews: '12350', type: 'food', area: '敦煌', isHot: true, sortOrder: 3 },
    { id: '204', name: '张掖臊面', image: 'https://gansu-culture.xyz/foods/food204-1.jpg', tags: ['张掖名吃', '汤鲜味美'], location: '张掖市', rating: '4.6', reviews: '8760', type: 'food', area: '张掖', isHot: true, sortOrder: 4 },
    { id: '205', name: '天水呱呱', image: 'https://gansu-culture.xyz/foods/food205-1.jpg', tags: ['天水特色', '香辣可口'], location: '天水市', rating: '4.7', reviews: '11230', type: 'food', area: '天水', isHot: true, sortOrder: 5 }
  ]);

  await Event.insertMany([
    { month: '7', day: '15', title: '敦煌文化旅游节', location: '敦煌市', date: new Date('2024-07-15'), sortOrder: 1 },
    { month: '8', day: '20', title: '天水伏羲文化节', location: '天水市', date: new Date('2024-08-20'), sortOrder: 2 },
    { month: '9', day: '10', title: '张掖丹霞文化旅游节', location: '张掖市', date: new Date('2024-09-10'), sortOrder: 3 },
    { month: '10', day: '1', title: '嘉峪关长城文化节', location: '嘉峪关市', date: new Date('2024-10-01'), sortOrder: 4 }
  ]);

  await City.insertMany([
    { name: '兰州市', desc: '甘肃省省会', banner: 'https://gansu-culture.xyz/cities/lanzhou.jpg', level: '省会城市', years: '始建于公元前86年', intro: '兰州是甘肃省省会，位于中国陆域版图的几何中心，是古丝绸之路重镇，黄河穿城而过，拥有丰富的历史文化和自然景观。', status: 1 },
    { name: '嘉峪关市', desc: '天下第一雄关', banner: 'https://gansu-culture.xyz/cities/jiayuguan.jpg', level: '地级市', years: '明代建关', intro: '嘉峪关市是明代万里长城的西起点，因嘉峪关关城而得名，是中国优秀旅游城市。', status: 1 },
    { name: '金昌市', desc: '镍都', banner: 'https://gansu-culture.xyz/cities/jinchang.jpg', level: '地级市', years: '1981年设市', intro: '金昌市因盛产镍而被誉为"中国镍都"，是一座新兴的工业城市。', status: 1 },
    { name: '白银市', desc: '铜城', banner: 'https://gansu-culture.xyz/cities/baiyin.jpg', level: '地级市', years: '1956年设市', intro: '白银市因铜矿开采而闻名，是中国重要的有色金属生产基地。', status: 1 },
    { name: '天水市', desc: '羲皇故里', banner: 'https://gansu-culture.xyz/cities/tianshui.jpg', level: '地级市', years: '始建于公元前688年', intro: '天水市是中华人文始祖伏羲的诞生地，拥有麦积山石窟等著名景点。', status: 1 },
    { name: '酒泉市', desc: '航天城', banner: 'https://gansu-culture.xyz/cities/jiuquan.jpg', level: '地级市', years: '汉代设郡', intro: '酒泉市是中国航天发射中心所在地，也是古丝绸之路的重要驿站。', status: 1 },
    { name: '张掖市', desc: '金张掖', banner: 'https://gansu-culture.xyz/cities/zhangye.jpg', level: '地级市', years: '汉代设郡', intro: '张掖市以"张国臂掖，以通西域"而得名，拥有世界著名的张掖丹霞地貌。', status: 1 },
    { name: '武威市', desc: '银武威', banner: 'https://gansu-culture.xyz/cities/wuwei.jpg', level: '地级市', years: '汉代设郡', intro: '武威市是丝绸之路重镇，拥有雷台汉墓、马踏飞燕等著名文物。', status: 1 },
    { name: '定西市', desc: '陇中重镇', banner: 'https://gansu-culture.xyz/cities/dingxi.jpg', level: '地级市', years: '宋代设镇', intro: '定西市是陇中地区的中心城市，以盛产中药材和马铃薯而闻名。', status: 1 },
    { name: '陇南市', desc: '陇上江南', banner: 'https://gansu-culture.xyz/cities/longnan.jpg', level: '地级市', years: '2004年设市', intro: '陇南市位于甘肃南部，气候湿润，风景秀丽，被誉为"陇上江南"。', status: 1 },
    { name: '平凉市', desc: '道教圣地', banner: 'https://gansu-culture.xyz/cities/pingliang.jpg', level: '地级市', years: '唐代设州', intro: '平凉市是道教圣地崆峒山所在地，拥有丰富的道教文化资源。', status: 1 },
    { name: '庆阳市', desc: '红色圣地', banner: 'https://gansu-culture.xyz/cities/qingyang.jpg', level: '地级市', years: '宋代设州', intro: '庆阳市是陕甘宁革命根据地的重要组成部分，也是周祖农耕文化的发源地。', status: 1 },
    { name: '临夏州', desc: '中国花儿之乡', banner: 'https://gansu-culture.xyz/cities/linxia.jpg', level: '自治州', years: '1956年成立', intro: '临夏回族自治州是中国花儿之乡，拥有丰富的民族文化和美食。', status: 1 },
    { name: '甘南州', desc: '藏区江南', banner: 'https://gansu-culture.xyz/cities/gannan.jpg', level: '自治州', years: '1953年成立', intro: '甘南藏族自治州是甘肃省唯一的藏族自治州，拥有美丽的草原和藏族文化。', status: 1 },
    { name: '敦煌市', desc: '丝路明珠', banner: 'https://gansu-culture.xyz/cities/dunhuang.jpg', level: '县级市', years: '汉代设郡', intro: '敦煌市是古丝绸之路的重镇，拥有莫高窟、鸣沙山月牙泉等世界著名景点。', status: 1 }
  ]);

  console.log('数据初始化完成');
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('MongoDB连接成功');
  await initData();
}).catch(err => {
  console.error('MongoDB连接失败:', err.message);
  process.exit(1);
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/home', require('./routes/home'));
app.use('/api/cultures', require('./routes/cultures'));
app.use('/api/spots', require('./routes/spots'));
app.use('/api/foods', require('./routes/foods'));
app.use('/api/events', require('./routes/events'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/quick-entries', require('./routes/quick-entries'));
app.use('/api/cities', require('./routes/cities'));

app.get('/', (req, res) => {
  res.send('云游甘肃后端服务运行中');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
EOF
```

#### 14. 安装依赖并启动服务

```bash
npm install --production
```

#### 15. 安装 PM2 进程管理器

```bash
sudo npm install -g pm2
pm2 start server.js --name gansu-backend
pm2 startup
pm2 save
```

#### 16. 验证服务

```bash
curl http://localhost:3000/
curl http://localhost:3000/api/home
```

## ✅ 验证结果

服务启动后，访问以下地址验证：

| 接口 | 地址 |
|------|------|
| 健康检查 | http://YOUR_SERVER_IP:3000/ |
| 首页数据 | http://YOUR_SERVER_IP:3000/api/home |
| 非遗列表 | http://YOUR_SERVER_IP:3000/api/cultures |
| 景点列表 | http://YOUR_SERVER_IP:3000/api/spots |
| 美食列表 | http://YOUR_SERVER_IP:3000/api/foods |
| 城市列表 | http://YOUR_SERVER_IP:3000/api/cities |

## 🔐 管理员登录

```bash
curl -X POST http://YOUR_SERVER_IP:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## 📝 后续操作

1. 将图片资源上传到七牛云存储空间
2. 在微信小程序后台配置合法域名 `https://gansu-culture.xyz`
3. 修改前端代码中的 API 地址为 `https://gansu-culture.xyz/api`