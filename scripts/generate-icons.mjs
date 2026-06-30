import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(__dir, '../public/icon.svg');
const svg = readFileSync(svgPath);

const sizes = [
  { name: 'icon-192.png',        size: 192 },
  { name: 'icon-512.png',        size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of sizes) {
  const out = resolve(__dir, '../public', name);
  await sharp(svg).resize(size, size).png().toFile(out);
  console.log(`✓ ${name} (${size}×${size})`);
}
