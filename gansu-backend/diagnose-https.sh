#!/bin/bash
# 诊断并修复 HTTPS
SERVER="ubuntu@YOUR_SERVER_IP"

echo "=== 诊断服务器 HTTPS 状态 ==="
ssh -o StrictHostKeyChecking=no "$SERVER" << 'ENDSSH'
echo "1. Nginx 状态:"
sudo systemctl status nginx --no-pager | head -5

echo ""
echo "2. 证书状态:"
sudo certbot certificates 2>&1

echo ""
echo "3. Nginx 配置:"
sudo nginx -T 2>/dev/null | grep -A5 "server_name gansu" | head -15

echo ""
echo "4. 端口监听:"
sudo ss -tlnp | grep -E "80|443|3000"

echo ""
echo "5. 本地测试:"
curl -s http://127.0.0.1:3000/api/home | head -c 100
echo ""
ENDSSH
