#!/bin/bash
# 修复 HTTPS — 重新申请证书
SERVER="ubuntu@YOUR_SERVER_IP"

ssh -o StrictHostKeyChecking=no "$SERVER" << 'ENDSSH'
set -e

echo "1. 清理 Nginx 重复配置..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo tee /etc/nginx/sites-available/gansu-culture > /dev/null << 'NGINX'
server {
    listen 80;
    server_name gansu-culture.xyz www.gansu-culture.xyz;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/gansu-culture /etc/nginx/sites-enabled/gansu-culture
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo nginx -t
sudo systemctl reload nginx
echo "   ✅ Nginx 配置已整理"

echo ""
echo "2. 申请 SSL 证书..."
sudo certbot --nginx -d gansu-culture.xyz --non-interactive --agree-tos --email admin@gansu-culture.xyz --redirect
echo "   ✅ SSL 证书已申请"

echo ""
echo "3. 验证 HTTPS..."
curl -s http://127.0.0.1:3000/api/home | head -c 100
echo ""

echo ""
echo "4. 端口检查..."
sudo ss -tlnp | grep -E "80|443|3000"
ENDSSH

echo ""
echo "=== 完成，验证: curl https://gansu-culture.xyz/api/home ==="
