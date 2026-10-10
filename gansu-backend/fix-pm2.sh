#!/bin/bash
# 修复后端 502 — 重启 PM2
SERVER="ubuntu@YOUR_SERVER_IP"

ssh -o StrictHostKeyChecking=no "$SERVER" << 'ENDSSH'
  cd /home/ubuntu
  echo "PM2 状态:"
  pm2 status
  echo ""
  echo "重启服务..."
  pm2 restart gansu-backend 2>/dev/null || pm2 start server.js --name gansu-backend
  pm2 save
  sleep 3
  echo ""
  echo "PM2 状态:"
  pm2 status
  echo ""
  echo "验证:"
  curl -s http://localhost:3000/api/home | head -c 100
ENDSSH
