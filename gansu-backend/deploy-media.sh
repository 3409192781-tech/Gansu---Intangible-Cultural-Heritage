#!/bin/bash
# 替换所有媒体 URL — 从 Unsplash 占位图 → 七牛云真实地址
SERVER="ubuntu@YOUR_SERVER_IP"
REMOTE_DIR="/home/ubuntu"

echo "=== 替换媒体 URL ==="

FILES=(
  "data/initData.js"
  "scripts/fix-media-urls.js"
)

echo "1. 上传文件..."
for file in "${FILES[@]}"; do
  mkdir -p "$(dirname "$file")"
  echo "   $file"
  scp -o StrictHostKeyChecking=no "$file" "$SERVER:$REMOTE_DIR/$file" || { echo "失败: $file"; exit 1; }
done
echo "   ✅ 上传完成"

echo ""
echo "2. 修复 MongoDB 中的媒体 URL..."
ssh -o StrictHostKeyChecking=no "$SERVER" << 'ENDSSH'
  cd /home/ubuntu
  mkdir -p scripts
  node scripts/fix-media-urls.js
ENDSSH

echo ""
echo "3. 重启服务..."
ssh -o StrictHostKeyChecking=no "$SERVER" << 'ENDSSH2'
  cd /home/ubuntu
  pm2 restart gansu-backend
  sleep 3
  echo "   验证:"
  curl -s http://localhost:3000/api/cultures/1 | head -c 300
  echo ""
  curl -s http://localhost:3000/api/spots/101 | head -c 250
ENDSSH2

echo ""
echo "=== 完成 ==="
