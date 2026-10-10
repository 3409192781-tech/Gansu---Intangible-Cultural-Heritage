const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRE || '24h';

// 生产环境密钥强度检查
if (process.env.USE_MEMORY_DB !== 'true') {
  const weakSecrets = [
    'JWT_SECRET_PLACEHOLDER',
    'example_weak_secret',
    'change_me',
    'secret'
  ];
  if (!secret || weakSecrets.includes(secret) || secret.length < 16) {
    console.error('========================================');
    console.error('⚠️  安全警告：生产环境 JWT_SECRET 过弱！');
    console.error('   请设置强随机字符串：');
    console.error('     node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    console.error('   服务仍可启动，但强烈建议尽快更新密钥');
    console.error('========================================');
  }
}

module.exports = {
  secret,
  expiresIn,
  algorithms: ['HS256']
};
