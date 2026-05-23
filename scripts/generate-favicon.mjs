// favicon 생성기 — public/favicon.svg + 32/180/192/512 PNG
// 사이트 헤더 로고와 동일한 디자인 (indigo→purple→pink 그라데이션 + 흰색 S)
import sharp from "sharp";
import opentype from "opentype.js";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "..", "public");
mkdirSync(publicDir, { recursive: true });

// 여기어때 잘난체로 'S' 그리기 (path 변환)
const font = opentype.parse(readFileSync(resolve(publicDir, "fonts", "Jalnan.woff")).buffer);

function sPath(size) {
  // viewBox 기준 size×size, 중앙에 S
  const fontSize = size * 0.75;
  const p = font.getPath("S", 0, 0, fontSize);
  const bb = p.getBoundingBox();
  const w = bb.x2 - bb.x1;
  const h = bb.y2 - bb.y1;
  const cx = size / 2 - bb.x1 - w / 2;
  const cy = size / 2 - bb.y1 - h / 2;
  return font.getPath("S", cx, cy, fontSize).toPathData(2);
}

// 작은 사이즈용 SVG (16px에서도 식별 가능하게 단순)
function svgFor(size, radius) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="50%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#g)"/>
  <path d="${sPath(size)}" fill="#ffffff"/>
</svg>`;
}

// 1) 메인 SVG favicon (vector, 모든 사이즈 대응)
const svgMain = svgFor(64, 14);
writeFileSync(resolve(publicDir, "favicon.svg"), svgMain, "utf-8");
console.log(`✅ favicon.svg`);

// 2) PNG 생성 — 32 (탭 기본), 180 (apple-touch-icon), 192 (PWA), 512 (PWA splash)
const SIZES = [
  { px: 32, name: "favicon-32.png", radius: 7 },
  { px: 180, name: "apple-touch-icon.png", radius: 40 },
  { px: 192, name: "icon-192.png", radius: 42 },
  { px: 512, name: "icon-512.png", radius: 112 },
];

for (const { px, name, radius } of SIZES) {
  const svg = svgFor(px, radius);
  await sharp(Buffer.from(svg))
    .resize(px, px)
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(resolve(publicDir, name));
  console.log(`✅ ${name} (${px}×${px})`);
}

// 3) favicon.ico 호환용 — 32px PNG 를 그대로 favicon.ico 로 복사 (대부분 브라우저가 PNG 형식 ico 지원)
//    완벽한 멀티사이즈 ICO 가 필요하면 별도 png-to-ico 사용 권장
const png32 = await sharp(Buffer.from(svgFor(32, 7))).resize(32, 32).png().toBuffer();
writeFileSync(resolve(publicDir, "favicon.ico"), png32);
console.log(`✅ favicon.ico (PNG 32×32 컨테이너)`);
