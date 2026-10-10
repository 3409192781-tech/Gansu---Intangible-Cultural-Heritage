// 更新管理员密码（运行一次即可）
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const newUser = process.env.ADMIN_USERNAME;
  const newPass = process.env.ADMIN_PASSWORD;

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPass, salt);

  const admin = await Admin.findOneAndUpdate(
    { username: { $in: ['admin', newUser] } },
    { username: newUser, password: hash },
    { upsert: true, new: true }
  );

  console.log('管理员已更新:', admin.username);
  await mongoose.disconnect();
}).catch(err => {
  console.error('失败:', err.message);
  process.exit(1);
});
