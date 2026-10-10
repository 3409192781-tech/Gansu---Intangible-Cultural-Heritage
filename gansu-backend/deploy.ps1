$sshArgs = @(
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=/dev/null",
    "ubuntu@YOUR_SERVER_IP"
)

function Run-SshCommand {
    param(
        [string]$command
    )
    Write-Host "执行: $command"
    $fullArgs = $sshArgs + @($command)
    Start-Process -FilePath "ssh" -ArgumentList $fullArgs -Wait -NoNewWindow
}

Write-Host "=== 开始部署云游甘肃后端服务 ==="

Write-Host "1. 创建日志目录"
Run-SshCommand "mkdir -p /home/ubuntu/gansu-backend/logs"

Write-Host "2. 更新系统包"
Run-SshCommand "sudo apt update -y"

Write-Host "3. 安装 Node.js"
Run-SshCommand "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
Run-SshCommand "sudo apt-get install -y nodejs"

Write-Host "4. 安装 MongoDB"
Run-SshCommand "wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -"
Run-SshCommand 'echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list'
Run-SshCommand "sudo apt update -y"
Run-SshCommand "sudo apt install -y mongodb-org"
Run-SshCommand "sudo systemctl start mongod"
Run-SshCommand "sudo systemctl enable mongod"

Write-Host "5. 安装项目依赖"
Run-SshCommand "cd /home/ubuntu/gansu-backend; npm install --production"

Write-Host "6. 修改环境变量"
Run-SshCommand "cd /home/ubuntu/gansu-backend; sed -i 's/USE_MEMORY_DB=true/USE_MEMORY_DB=false/g' .env"

Write-Host "7. 安装 PM2"
Run-SshCommand "sudo npm install -g pm2"

Write-Host "8. 启动服务"
Run-SshCommand "cd /home/ubuntu/gansu-backend; pm2 start server.js --name gansu-backend"

Write-Host "9. 设置开机自启"
Run-SshCommand "pm2 startup"
Run-SshCommand "pm2 save"

Write-Host "=== 部署完成 ==="
Write-Host "服务已启动，运行在 http://YOUR_SERVER_IP:3000"