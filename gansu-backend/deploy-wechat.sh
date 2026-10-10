#!/bin/bash
# 部署微信登录功能
SERVER="ubuntu@YOUR_SERVER_IP"
REMOTE_DIR="/home/ubuntu"

echo "=== 部署微信登录 ==="

FILES=(
  ".env"
  "models/User.js"
  "routes/auth.js"
)

echo "1. 上传文件..."
for file in "${FILES[@]}"; do
  echo "   $file"
  scp -o StrictHostKeyChecking=no "$file" "$SERVER:$REMOTE_DIR/$file" || { echo "失败: $file"; exit 1; }
done
echo "   ✅ 上传完成"

echo ""
echo "2. 重启服务并验证..."
ssh -o StrictHostKeyChecking=no "$SERVER" << 'ENDSSH'
  cd /home/ubuntu
  pm2 restart gansu-backend
  sleep 3
  echo "   本地测试微信登录端点:"
  curl -s -X POST http://localhost:3000/api/auth/wechat-login \
    -H "Content-Type: application/json" \
    -d '{"code":"test"}' | head -c 200
  echo ""
ENDSSH

echo ""
echo "=== 完成 ==="
echo "下一步: 在 HBuilderX 中重新编译前端 (运行 → 小程序 → 微信)"
