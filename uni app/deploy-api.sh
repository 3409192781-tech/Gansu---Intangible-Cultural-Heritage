#!/bin/bash
echo "=== 甘肃文化小程序后端部署脚本 ==="

echo ""
echo "1. 检查 Node.js 版本"
node --version

echo ""
echo "2. 检查项目目录"
ls -la /home/ubuntu/gansu-culture-api/

echo ""
echo "3. 检查环境变量"
cat /home/ubuntu/gansu-culture-api/.env

echo ""
echo "4. 安装依赖"
cd /home/ubuntu/gansu-culture-api && npm install

echo ""
echo "5. 启动服务"
cd /home/ubuntu/gansu-culture-api && pm2 start server.js --name gansu-culture-api

echo ""
echo "6. 检查 PM2 状态"
pm2 status

echo ""
echo "7. 检查服务日志"
pm2 logs gansu-culture-api --lines 20

echo ""
echo "8. 测试 API"
curl http://localhost:3000/api/home

echo ""
echo "=== 部署完成 ==="
