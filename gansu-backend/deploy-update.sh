#!/bin/bash
# 云游甘肃后端更新部署 v3 — 上传所有修改过的文件
SERVER="ubuntu@YOUR_SERVER_IP"
REMOTE_DIR="/home/ubuntu"

echo "=== 全面部署 ==="

FILES=(
  "server.js"
  "data/initData.js"
  "reinit-db.js"
  "models/Admin.js"
  "models/Banner.js"
  "models/City.js"
  "models/Culture.js"
  "models/Event.js"
  "models/Food.js"
  "models/QuickEntry.js"
  "models/Spot.js"
  "routes/auth.js"
  "routes/banners.js"
  "routes/cities.js"
  "routes/cultures.js"
  "routes/events.js"
  "routes/foods.js"
  "routes/home.js"
  "routes/quick-entries.js"
  "routes/spots.js"
  "middleware/auth.js"
  "utils/response.js"
)

echo "1. 上传所有文件..."
for file in "${FILES[@]}"; do
  echo "   $file"
  scp -o StrictHostKeyChecking=no "$file" "$SERVER:$REMOTE_DIR/$file" || { echo "❌ 失败: $file"; exit 1; }
done
echo "   ✅ 全部上传完成"
echo ""

echo "2. 重启服务..."
ssh -o StrictHostKeyChecking=no "$SERVER" << 'ENDSSH'
  cd /home/ubuntu
  npm install --production
  pm2 restart gansu-backend 2>/dev/null || pm2 start server.js --name gansu-backend
  pm2 save
  sleep 4
  echo ""
  echo "=== API 验证 ==="
  echo "Home:"
  curl -s http://localhost:3000/api/home | head -c 300
  echo ""
  echo "Culture #1:"
  curl -s http://localhost:3000/api/cultures/1 | head -c 300
  echo ""
  echo "Spots count:"
  curl -s http://localhost:3000/api/spots | head -c 150
  echo ""
ENDSSH

echo ""
echo "=== 完成 ==="
