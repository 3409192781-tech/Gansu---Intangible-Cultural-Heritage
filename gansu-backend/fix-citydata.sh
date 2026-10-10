#!/bin/bash
SERVER="ubuntu@YOUR_SERVER_IP"

echo "=== 修复城市数据引用 ==="

scp -o StrictHostKeyChecking=no scripts/fix-city-heritages.js "$SERVER:/home/ubuntu/scripts/fix-city-heritages.js"
echo "✅ 脚本已上传"

ssh -o StrictHostKeyChecking=no "$SERVER" << 'ENDSSH'
  cd /home/ubuntu
  node scripts/fix-city-heritages.js
  pm2 restart gansu-backend
  echo "✅ 修复完成"
ENDSSH
