#!/bin/bash
SERVER="ubuntu@YOUR_SERVER_IP"
echo "=== 部署搜索功能 ==="

scp -o StrictHostKeyChecking=no server.js routes/search.js "$SERVER:/home/ubuntu/"
echo "✅ 已上传"

ssh -o StrictHostKeyChecking=no "$SERVER" << 'ENDSSH'
  cd /home/ubuntu
  pm2 restart gansu-backend
  sleep 3
  echo "验证:"
  curl -s "http://localhost:3000/api/search?keyword=敦煌" | head -c 300
  echo ""
ENDSSH
echo "=== 完成 ==="
