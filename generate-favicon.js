const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  const svgPath = path.join(__dirname, 'public', 'icons', 'icon-192x192.svg');
  const icoPath = path.join(__dirname, 'public', 'favicon.ico');

  try {
    // Convert SVG to ICO (favicon)
    await sharp(svgPath)
      .resize(32, 32) // Standard favicon size
      .png()
      .toFile(icoPath.replace('.ico', '.png'));

    // For ICO, we can use a PNG as favicon.ico
    await fs.promises.rename(icoPath.replace('.ico', '.png'), icoPath);

    console.log('Favicon generated successfully');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon();
