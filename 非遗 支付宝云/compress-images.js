const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const staticDir = path.join(__dirname, 'static');

const maxWidth = 600;
const maxHeight = 600;
const quality = 60;

let totalSaved = 0;
let processedCount = 0;

function compressImage(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const originalSize = fs.statSync(inputPath).size;
    
    sharp(inputPath)
      .rotate()
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: quality, progressive: true })
      .toFile(outputPath, (err, info) => {
        if (err) {
          reject(err);
          return;
        }
        const newSize = info.size;
        const saved = originalSize - newSize;
        const savedPercent = ((saved / originalSize) * 100).toFixed(1);
        totalSaved += saved;
        processedCount++;
        console.log(`${path.basename(inputPath)}: ${(originalSize/1024).toFixed(1)}KB -> ${(newSize/1024).toFixed(1)}KB (节省 ${savedPercent}%)`);
        resolve();
      });
  });
}

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else if (/\.(jpg|jpeg)$/i.test(file)) {
      const tempPath = fullPath + '.tmp.jpg';
      try {
        await compressImage(fullPath, tempPath);
        fs.unlinkSync(fullPath);
        fs.renameSync(tempPath, fullPath);
      } catch (err) {
        console.error(`处理 ${file} 失败:`, err.message);
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    }
  }
}

console.log('开始压缩图片...');
console.log(`目标: 最大尺寸 ${maxWidth}x${maxHeight}, 质量 ${quality}%\n`);

processDirectory(staticDir).then(() => {
  console.log(`\n完成! 共处理 ${processedCount} 张图片`);
  console.log(`总共节省: ${(totalSaved / 1024).toFixed(1)} KB (${(totalSaved / 1024 / 1024).toFixed(2)} MB)`);
}).catch(err => {
  console.error('处理出错:', err);
});
