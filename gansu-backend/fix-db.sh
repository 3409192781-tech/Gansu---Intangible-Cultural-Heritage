#!/bin/bash
# 修复数据库 — 删除旧数据 + 重建索引 + 重新初始化

ssh -o StrictHostKeyChecking=no ubuntu@YOUR_SERVER_IP << 'ENDSSH'
  cd /home/ubuntu
  echo "1. 连接 MongoDB 并清理旧索引..."
  mongosh gansu_culture --eval "
    db.events.dropIndex('id_1').catch(() => print('索引 id_1 不存在，跳过'));
    db.cultures.dropIndex('id_1').catch(() => print('索引 id_1 不存在，跳过'));
    db.spots.dropIndex('id_1').catch(() => print('索引 id_1 不存在，跳过'));
    db.foods.dropIndex('id_1').catch(() => print('索引 id_1 不存在，跳过'));
    db.cities.dropIndex('id_1').catch(() => print('索引 id_1 不存在，跳过'));
    print('索引清理完成');
  "

  echo ""
  echo "2. 重新初始化数据..."
  node reinit-db.js

  echo ""
  echo "3. 重启服务..."
  pm2 restart gansu-backend
  sleep 3

  echo ""
  echo "4. 验证..."
  curl -s http://localhost:3000/api/home | head -c 300
  echo ""
  curl -s http://localhost:3000/api/cultures/1 | head -c 300
ENDSSH
