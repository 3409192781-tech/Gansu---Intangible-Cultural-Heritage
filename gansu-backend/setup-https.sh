#!/bin/bash
# 一键配置 HTTPS — Nginx + Let's Encrypt SSL
# 运行: bash setup-https.sh (在 Git Bash 中,需要输入服务器密码)

SERVER="ubuntu@YOUR_SERVER_IP"
DOMAIN="${1:-gansu-culture.xyz}"

echo "=== 配置 HTTPS: $DOMAIN ==="
echo ""

ssh -o StrictHostKeyChecking=no "$SERVER" << 'ENDSSH'
set -e

echo "1. 安装 Nginx..."
sudo apt update -y
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
echo "   ✅ Nginx 已安装并运行"

echo ""
echo "2. 配置 Nginx 反向代理..."
sudo tee /etc/nginx/sites-available/gansu-culture > /dev/null << 'NGINX'
server {
    listen 80;
    server_name gansu-culture.xyz www.gansu-culture.xyz;

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康检查
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # 七牛云验证文件（如果需要的话）
    location /.well-known/ {
        root /var/www/html;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/gansu-culture /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
echo "   ✅ Nginx 配置完成"

echo ""
echo "3. 配置防火墙..."
sudo ufw allow 80/tcp 2>/dev/null || true
sudo ufw allow 443/tcp 2>/dev/null || true
echo "   ✅ 端口已开放"

echo ""
echo "4. 安装 Certbot 并申请 SSL 证书..."
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d gansu-culture.xyz -d www.gansu-culture.xyz --non-interactive --agree-tos --email admin@gansu-culture.xyz --redirect
echo "   ✅ SSL 证书已配置"

echo ""
echo "5. 重启 Nginx..."
sudo systemctl reload nginx
echo "   ✅ Nginx 已重启"

echo ""
echo "6. 验证..."
echo "   HTTP:"
curl -s http://localhost/api/ | head -c 100
echo ""
echo "   HTTPS:"
curl -sk https://localhost/api/ | head -c 100
echo ""

ENDSSH

echo ""
echo "=== HTTPS 配置完成 ==="
echo "验证: curl https://$DOMAIN/api/home"
