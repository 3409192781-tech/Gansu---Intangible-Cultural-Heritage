const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'static', 'login-bg.jpg');
const outputPath = path.join(__dirname, 'static', 'login-bg-compressed.jpg');

const originalSize = fs.statSync(inputPath).size;
console.log(`原始大小: ${(originalSize/1024).toFixed(1)} KB`);

sharp(inputPath)
  .rotate()
  .resize({ width: 750, withoutEnlargement: true })
  .jpeg({ quality: 65, progressive: true })
  .toFile(outputPath, (err, info) => {
    if (err) {
      console.error('压缩失败:', err);
      return;
    }
    const newSize = info.size;
    const saved = originalSize - newSize;
    const savedPercent = ((saved / originalSize) * 100).toFixed(1);
    console.log(`压缩后: ${(newSize/1024).toFixed(1)} KB`);
    console.log(`节省: ${savedPercent}%`);
    
    fs.unlinkSync(inputPath);
    fs.renameSync(outputPath, inputPath);
    console.log('已替换原文件');
  });
