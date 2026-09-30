import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Browser Tab Favicon SVG (crisp, transparent background, book icon with terracotta & gold ribbon)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Book Outer Shape -->
  <path d="M32 18C26 12 14 12 8 14V50C14 48 26 48 32 54C38 48 50 48 56 50V14C50 12 38 12 32 18Z" fill="#C86D51"/>
  <!-- Left Pages Stack -->
  <path d="M10 16C16 14 26 14 31 19.5V52.5C26 47.5 16 47.5 10 49.5V16Z" fill="#FDFBF7"/>
  <!-- Right Pages Stack -->
  <path d="M54 16C48 14 38 14 33 19.5V52.5C38 47.5 48 47.5 54 49.5V16Z" fill="#F4F1EA"/>
  <!-- Subtle Page Lines Left -->
  <line x1="14" y1="24" x2="27" y2="24" stroke="#DCD6CA" stroke-width="2" stroke-linecap="round"/>
  <line x1="14" y1="31" x2="27" y2="31" stroke="#DCD6CA" stroke-width="2" stroke-linecap="round"/>
  <line x1="14" y1="38" x2="23" y2="38" stroke="#DCD6CA" stroke-width="2" stroke-linecap="round"/>
  <!-- Subtle Page Lines Right -->
  <line x1="37" y1="24" x2="50" y2="24" stroke="#DCD6CA" stroke-width="2" stroke-linecap="round"/>
  <line x1="37" y1="31" x2="50" y2="31" stroke="#DCD6CA" stroke-width="2" stroke-linecap="round"/>
  <line x1="37" y1="38" x2="45" y2="38" stroke="#DCD6CA" stroke-width="2" stroke-linecap="round"/>
  <!-- Center Book Spine & Golden Bookmark Ribbon -->
  <path d="M32 18V44L35 41L38 44V18" fill="#D4A373"/>
  <line x1="32" y1="18" x2="32" y2="54" stroke="#A8543B" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

// 2. App Logo / Home Screen Icon SVG (solid rich terracotta background with rounded corners for mobile app icon)
const appIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="appBg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#DE795D"/>
      <stop offset="100%" stop-color="#B2553B"/>
    </linearGradient>
    <linearGradient id="pageGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F4EFE6"/>
    </linearGradient>
    <filter id="shadow" x="0" y="0" width="512" height="512" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#5A2416" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- App Icon Background -->
  <rect width="512" height="512" rx="112" fill="url(#appBg)"/>

  <!-- Subtle Inner Border -->
  <rect x="12" y="12" width="488" height="488" rx="100" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="6"/>

  <!-- Open Book Illustration with shadow -->
  <g filter="url(#shadow)">
    <!-- Base Cover Spine -->
    <path d="M256 150C208 102 112 102 64 118V390C112 374 208 374 256 422C304 374 400 374 448 390V118C400 102 304 102 256 150Z" fill="#8E3E28"/>
    
    <!-- Left Pages Sheet -->
    <path d="M80 134C128 118 208 118 248 162V408C208 368 128 368 80 384V134Z" fill="url(#pageGrad)"/>
    
    <!-- Right Pages Sheet -->
    <path d="M432 134C384 118 304 118 264 162V408C304 368 384 368 432 384V134Z" fill="#F0EBE1"/>

    <!-- Left Page Texture Lines -->
    <line x1="112" y1="198" x2="216" y2="198" stroke="#D3C9B8" stroke-width="12" stroke-linecap="round"/>
    <line x1="112" y1="254" x2="216" y2="254" stroke="#D3C9B8" stroke-width="12" stroke-linecap="round"/>
    <line x1="112" y1="310" x2="184" y2="310" stroke="#D3C9B8" stroke-width="12" stroke-linecap="round"/>

    <!-- Right Page Texture Lines -->
    <line x1="296" y1="198" x2="400" y2="198" stroke="#D3C9B8" stroke-width="12" stroke-linecap="round"/>
    <line x1="296" y1="254" x2="400" y2="254" stroke="#D3C9B8" stroke-width="12" stroke-linecap="round"/>
    <line x1="296" y1="310" x2="352" y2="310" stroke="#D3C9B8" stroke-width="12" stroke-linecap="round"/>

    <!-- Golden Bookmark Ribbon -->
    <path d="M256 150V350L278 330L300 350V150" fill="#E8B86D"/>
    
    <!-- Center Crease -->
    <line x1="256" y1="150" x2="256" y2="422" stroke="#682A1A" stroke-width="8" stroke-linecap="round"/>
  </g>
</svg>`;

// 3. Maskable Icon SVG (with extra safe zone margin for Android adaptive icon clipping)
const maskableIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="appBgMaskable" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#DE795D"/>
      <stop offset="100%" stop-color="#B2553B"/>
    </linearGradient>
  </defs>

  <!-- Full-bleed background -->
  <rect width="512" height="512" fill="url(#appBgMaskable)"/>

  <!-- Centered Book in the Safe 75% Zone -->
  <g transform="translate(64, 64) scale(0.75)">
    <path d="M256 150C208 102 112 102 64 118V390C112 374 208 374 256 422C304 374 400 374 448 390V118C400 102 304 102 256 150Z" fill="#8E3E28"/>
    <path d="M80 134C128 118 208 118 248 162V408C208 368 128 368 80 384V134Z" fill="#FFFFFF"/>
    <path d="M432 134C384 118 304 118 264 162V408C304 368 384 368 432 384V134Z" fill="#F0EBE1"/>

    <line x1="112" y1="198" x2="216" y2="198" stroke="#D3C9B8" stroke-width="12" stroke-linecap="round"/>
    <line x1="112" y1="254" x2="216" y2="254" stroke="#D3C9B8" stroke-width="12" stroke-linecap="round"/>
    <line x1="112" y1="310" x2="184" y2="310" stroke="#D3C9B8" stroke-width="12" stroke-linecap="round"/>

    <line x1="296" y1="198" x2="400" y2="198" stroke="#D3C9B8" stroke-width="12" stroke-linecap="round"/>
    <line x1="296" y1="254" x2="400" y2="254" stroke="#D3C9B8" stroke-width="12" stroke-linecap="round"/>
    <line x1="296" y1="310" x2="352" y2="310" stroke="#D3C9B8" stroke-width="12" stroke-linecap="round"/>

    <path d="M256 150V350L278 330L300 350V150" fill="#E8B86D"/>
    <line x1="256" y1="150" x2="256" y2="422" stroke="#682A1A" stroke-width="8" stroke-linecap="round"/>
  </g>
</svg>`;

async function run() {
  console.log('Generating book icons and PWA assets in public/...');

  // Write SVGs
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), faviconSvg, 'utf-8');

  // Render PNGs using sharp
  const appBuffer = Buffer.from(appIconSvg);
  const maskableBuffer = Buffer.from(maskableIconSvg);
  const faviconBuffer = Buffer.from(faviconSvg);

  // 1. apple-touch-icon.png (180x180)
  await sharp(appBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Created public/apple-touch-icon.png (180x180)');

  // 2. pwa-192x192.png
  await sharp(appBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ Created public/pwa-192x192.png (192x192)');

  // 3. pwa-512x512.png
  await sharp(appBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✓ Created public/pwa-512x512.png (512x512)');

  // 4. pwa-maskable-512x512.png
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✓ Created public/pwa-maskable-512x512.png (512x512)');

  // 5. favicon-32x32.png
  await sharp(faviconBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✓ Created public/favicon-32x32.png (32x32)');

  console.log('All icons generated successfully!');
}

run().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
