const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGE_DIRS = [
  path.join(__dirname, '../public/images'),
  path.join(__dirname, '../public/images/organisations'),
];

const exts = ['.jpg', '.jpeg', '.png'];

function getAllImages(dir) {
  return fs.readdirSync(dir)
    .filter(f => exts.includes(path.extname(f).toLowerCase()))
    .map(f => path.join(dir, f));
}

async function compressImage(file) {
  try {
    const outFile = file.replace(/\.(png|jpg|jpeg)$/i, '.jpg');
    const buffer = fs.readFileSync(file);
    const compressed = await sharp(buffer)
      .resize(512, 512, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();
    fs.writeFileSync(outFile, compressed);
    if (outFile !== file) fs.unlinkSync(file); // Remove original if extension changed
    console.log(`Compressed: ${file} -> ${outFile}`);
  } catch (err) {
    console.warn(`Skipped (not a valid image or unsupported): ${file}`);
  }
}

(async () => {
  for (const dir of IMAGE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const images = getAllImages(dir);
    for (const img of images) {
      await compressImage(img);
    }
  }
  console.log('All images compressed!');
})(); 