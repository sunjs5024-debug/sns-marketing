// public/og-cover-v2.png 생성기
// 1200×630 (페북/카톡/X 권장 비율 1.91:1)
// 폰트: 여기어때 잘난체 → opentype.js 로 텍스트→path 변환 (시스템 폰트 의존성 X)
import sharp from "sharp";
import opentype from "opentype.js";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, "..", "public", "og-cover-v2.png");
mkdirSync(dirname(out), { recursive: true });

// 잘난체 로드 (WOFF)
const fontPath = resolve(__dirname, "..", "public", "fonts", "Jalnan.woff");
const font = opentype.parse(readFileSync(fontPath).buffer);

// 텍스트 → SVG path 변환 헬퍼
// 잘난체는 공백 글리프가 없으므로 직접 처리해야 함.
//
// 전략:
//  - tracking(자간)이 필요한 경우(영문 라벨 등): char-by-char 그리기
//  - 기본: 공백 기준으로 단어를 잘라서 단어 단위로 getPath() (글리프 메트릭 문제 없음)
function textPath(str, x, y, size, fill, opts = {}) {
  const tracking = opts.tracking ?? 0;
  const anchor = opts.anchor ?? "start"; // "start" | "middle" | "end"
  const spaceWidth = size * 0.32; // 공백 fallback 너비

  // ── 모드 1: char-by-char (자간 필요할 때) ──────────────────
  if (tracking > 0) {
    const chars = [...str];
    const widths = chars.map((ch) => {
      if (ch === " ") return spaceWidth;
      const g = font.charToGlyph(ch);
      if (g.index === 0) return spaceWidth;
      return font.getAdvanceWidth(ch, size);
    });
    const totalWidth =
      widths.reduce((s, w) => s + w, 0) + tracking * Math.max(0, chars.length - 1);

    let startX = x;
    if (anchor === "middle") startX = x - totalWidth / 2;
    else if (anchor === "end") startX = x - totalWidth;

    let parts = "";
    let cursor = startX;
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if (ch !== " " && font.charToGlyph(ch).index !== 0) {
        const d = font.getPath(ch, cursor, y, size).toPathData(2);
        parts += `<path d="${d}" fill="${fill}"/>`;
      }
      cursor += widths[i] + tracking;
    }
    return parts;
  }

  // ── 모드 2: 단어 단위 그리기 (기본) ─────────────────────────
  // getPath() 가 한글 음절 글자별 메트릭을 잘못 계산하는 케이스를 피하기 위해,
  // 공백으로 split 한 뒤 각 단어를 한 번에 그림.
  const words = str.split(" ");

  // 각 단어 측정 — 단어 자체의 advance 합으로 폭 계산 (bbox가 글리프 밖으로 튀어나오는 경우 보호)
  const wordInfos = words.map((w) => {
    if (w.length === 0) return { width: 0, draw: () => "" };
    let advWidth = 0;
    for (const ch of w) advWidth += font.getAdvanceWidth(ch, size);
    return {
      width: advWidth,
      draw: (xx) => {
        const d = font.getPath(w, xx, y, size).toPathData(2);
        return `<path d="${d}" fill="${fill}"/>`;
      },
    };
  });

  const totalWidth = wordInfos.reduce(
    (s, w, i) => s + w.width + (i > 0 ? spaceWidth : 0),
    0,
  );

  let startX = x;
  if (anchor === "middle") startX = x - totalWidth / 2;
  else if (anchor === "end") startX = x - totalWidth;

  let parts = "";
  let cursor = startX;
  wordInfos.forEach((w, i) => {
    if (i > 0) cursor += spaceWidth;
    parts += w.draw(cursor);
    cursor += w.width;
  });
  return parts;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5f3ff"/>
      <stop offset="50%" stop-color="#faf5ff"/>
      <stop offset="100%" stop-color="#fdf2f8"/>
    </linearGradient>
    <linearGradient id="logo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="50%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <radialGradient id="blob1" cx="0%" cy="0%" r="60%">
      <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#a78bfa" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blob2" cx="100%" cy="100%" r="60%">
      <stop offset="0%" stop-color="#f472b6" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#f472b6" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- 배경 + 블롭 -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="100" cy="100" r="320" fill="url(#blob1)"/>
  <circle cx="1100" cy="530" r="320" fill="url(#blob2)"/>

  <!-- 좌측 S 로고 박스 -->
  <rect x="95" y="215" width="200" height="200" rx="44" ry="44" fill="url(#logo)"/>
  ${textPath("S", 195, 372, 170, "#ffffff", { anchor: "middle" })}

  <!-- 상단 라벨 (영문, 보라색, 자간 넓게) -->
  ${textPath("SNS MARKETING & SEO RANKING", 355, 252, 22, "#7c3aed", { tracking: 6 })}

  <!-- 큰 브랜드명 -->
  ${textPath("SNS소셜팩토리", 355, 340, 88, "#111827")}

  <!-- 캐치카피 -->
  ${textPath("SNS 마케팅 · 검색 상위노출 1번지", 355, 408, 36, "#374151")}

  <!-- 플랫폼 -->
  ${textPath("인스타 · 유튜브 · 틱톡 · 카카오톡 · 스마트스토어 · 네이버", 355, 472, 22, "#6b7280")}

  <!-- 하단 도메인 -->
  ${textPath("sns늘리기.kr", 600, 595, 20, "#9ca3af", { anchor: "middle" })}
</svg>`;

// 디버그용 SVG
writeFileSync(resolve(__dirname, "..", "public", "og-cover.svg"), svg, "utf-8");

await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .png({ quality: 95, compressionLevel: 9 })
  .toFile(out);

console.log(`✅ generated: ${out}`);
console.log(`   font: 여기어때 잘난체 (text → path 변환, 시스템 폰트 의존성 없음)`);
