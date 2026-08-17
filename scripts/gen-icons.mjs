// Skrip penjanaan ikon & logo daripada fail logo rasmi sekolah (LogoSFX.jpg).
// Menghasilkan:
//  - public/logo.png          -> imej logo untuk paparan dalam aplikasi
//  - public/favicon.png       -> ikon tab penyemak imbas
//  - public/icons/icon-192.png, icon-512.png, icon-512-maskable.png (PWA)
//
// Jalankan: npm run gen:icons
import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const iconsDir = join(publicDir, "icons");
const source = join(root, "LogoSFX.jpg");

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

// Fail logo untuk paparan dalam aplikasi (512px, duduk di atas putih)
await sharp(source)
  .resize(512, 512, { fit: "contain", background: WHITE })
  .png()
  .toFile(join(publicDir, "logo.png"));
console.log("✓ public/logo.png");

// Favicon (72px)
await sharp(source)
  .resize(72, 72, { fit: "contain", background: WHITE })
  .png()
  .toFile(join(publicDir, "favicon.png"));
console.log("✓ public/favicon.png");

// Ikon PWA
const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-512-maskable.png", size: 512, padding: 0.2 },
];

for (const { name, size, padding = 0 } of sizes) {
  const inner = size - Math.round(size * padding * 2);
  if (padding > 0) {
    // maskable: logo dalam zon selamat pusat (80%), dikelilingi latar putih
    await sharp(source)
      .resize(inner, inner, { fit: "contain", background: WHITE })
      .extend({
        top: Math.round(size * padding),
        bottom: Math.round(size * padding),
        left: Math.round(size * padding),
        right: Math.round(size * padding),
        background: WHITE,
      })
      .png()
      .toFile(join(iconsDir, name));
  } else {
    await sharp(source)
      .resize(size, size, { fit: "contain", background: WHITE })
      .png()
      .toFile(join(iconsDir, name));
  }
  console.log(`✓ icons/${name}`);
}

console.log("Ikon dan logo dijana.");
