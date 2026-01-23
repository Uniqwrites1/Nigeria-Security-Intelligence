const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng(svgPath, pngPath, size) {
  try {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    console.log(`Converted ${svgPath} to ${pngPath}`);
  } catch (error) {
    console.error(`Error converting ${svgPath}:`, error);
  }
}

async function main() {
  const iconsDir = path.join(__dirname, 'public', 'icons');
  const svgPath = path.join(iconsDir, 'icon-192x192.svg');

  // Convert to PNGs
  await convertSvgToPng(svgPath, path.join(iconsDir, 'icon-72x72.png'), 72);
  await convertSvgToPng(svgPath, path.join(iconsDir, 'icon-192x192.png'), 192);
  await convertSvgToPng(svgPath, path.join(iconsDir, 'icon-512x512.png'), 512);

  console.log('Icon conversion complete');
}

main();
