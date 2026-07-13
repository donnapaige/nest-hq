// Run once: node scripts/generate-icons.mjs
// Generates PNG app icons at all required sizes from an inline SVG.

import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// House icon on brand blue background — matches the login screen branding
function makeSvg(size) {
  const pad = size * 0.15;
  const inner = size - pad * 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#334266"/>
  <svg x="${pad}" y="${pad}" width="${inner}" height="${inner}" viewBox="0 0 24 24" fill="none">
    <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M9 22V12h6v10" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</svg>`;
}

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512, 1024];

async function run() {
  const iconsDir = join(root, 'public', 'icons');
  const assetsDir = join(root, 'assets');
  await mkdir(iconsDir, { recursive: true });
  await mkdir(assetsDir, { recursive: true });

  for (const size of sizes) {
    const svg = Buffer.from(makeSvg(size));
    const outPath = join(iconsDir, `${size}.png`);
    await sharp(svg).png().toFile(outPath);
    console.log(`✓ public/icons/${size}.png`);
  }

  // Also write the 1024 source icon to assets/icon.png for capacitor-assets
  const svg1024 = Buffer.from(makeSvg(1024));
  await sharp(svg1024).png().toFile(join(assetsDir, 'icon.png'));
  console.log('✓ assets/icon.png (Capacitor source)');

  // Splash screen source (white background, centered icon)
  const splashSize = 2732;
  const iconSize = 600;
  const iconPad = (splashSize - iconSize) / 2;
  const splashSvg = Buffer.from(`<svg width="${splashSize}" height="${splashSize}" viewBox="0 0 ${splashSize} ${splashSize}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${splashSize}" height="${splashSize}" fill="#F6F3EC"/>
  <svg x="${iconPad}" y="${iconPad}" width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}">
    <rect width="${iconSize}" height="${iconSize}" rx="${iconSize * 0.22}" fill="#334266"/>
    <svg x="${iconSize * 0.15}" y="${iconSize * 0.15}" width="${iconSize * 0.7}" height="${iconSize * 0.7}" viewBox="0 0 24 24" fill="none">
      <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M9 22V12h6v10" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </svg>
</svg>`);
  await sharp(splashSvg).png().toFile(join(assetsDir, 'splash.png'));
  console.log('✓ assets/splash.png (Capacitor splash source)');

  console.log('\nAll icons generated successfully.');
}

run().catch((e) => { console.error(e); process.exit(1); });
