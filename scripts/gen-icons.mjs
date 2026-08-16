// Skrip penjanaan ikon PWA placeholder.
// Guna sharp untuk tukar SVG kepada PNG pada saiz 192, 512, dan maskable.
// Logo rasmi sekolah boleh digantikan dengan menukar file public/favicon.svg
// dan menjalankan semula skrip ini.

import sharp from "sharp";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public", "icons");
const svg = readFileSync(join(__dirname, "..", "public", "favicon.svg"));

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  // maskable: padding 20% lebih untuk Android adaptive icon
  { name: "icon-512-maskable.png", size: 512, padding: 0.2 },
];

for (const { name, size, padding = 0 } of sizes) {
  const inner = size - Math.round(size * padding * 2);
  await sharp(svg)
    .resize(inner, inner)
    .extend({
      top: Math.round(size * padding),
      bottom: Math.round(size * padding),
      left: Math.round(size * padding),
      right: Math.round(size * padding),
      background: { r: 163, g: 230, b: 53, alpha: 1 },
    })
    .png()
    .toFile(join(publicDir, name));
  console.log(`✓ ${name}`);
}
console.log("Ikon PWA dijana.");
