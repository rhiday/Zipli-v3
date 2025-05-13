const fs = require('fs');
const path = require('path');

const IMAGE_DIRS = [
  path.join(__dirname, '../public/images'),
  path.join(__dirname, '../public/images/organisations'),
];
const exts = ['.jpg', '.jpeg', '.png', '.svg', '.gif', '.bmp', '.webp', '.ico'];

function getAllImages(dir) {
  return fs.readdirSync(dir)
    .filter(f => exts.includes(path.extname(f).toLowerCase()))
    .map(f => path.join(dir, f));
}

function isImageUsed(imagePath, codeFiles) {
  const relPath = imagePath.split('public')[1].replace(/\\/g, '/');
  return codeFiles.some(file => {
    const content = fs.readFileSync(file, 'utf8');
    return content.includes(relPath);
  });
}

function getAllCodeFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllCodeFiles(filePath));
    } else if (filePath.match(/\.(js|ts|jsx|tsx|json)$/)) {
      results.push(filePath);
    }
  });
  return results;
}

(async () => {
  const codeFiles = getAllCodeFiles(path.join(__dirname, '../src'));
  let unused = [];
  for (const dir of IMAGE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const images = getAllImages(dir);
    for (const img of images) {
      if (!isImageUsed(img, codeFiles)) {
        unused.push(img);
      }
    }
  }
  if (unused.length === 0) {
    console.log('No unused images found!');
  } else {
    console.log('Unused images:');
    unused.forEach(img => console.log(img));
    unused.forEach(img => fs.unlinkSync(img));
  }
})(); 