// 빌드 후 nitro.mjs 패치
//   Prisma 7 + Node 24 호환 — globalThis.__dirname 을 process.cwd() 로 교체
//   (Nuxt 빌드 시 globalThis._importMeta_.url 이 "_entry.js" 같은 가짜 URL 이라 fileURLToPath가 ERR_INVALID_FILE_URL_PATH 던짐)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const target = resolve(process.cwd(), ".output/server/chunks/_/nitro.mjs");

if (!existsSync(target)) {
  console.warn(`[patch-nitro] 파일 없음: ${target} — 빌드 안 한 듯, skip`);
  process.exit(0);
}

const content = readFileSync(target, "utf-8");
const FROM = `globalThis["__dirname"] = path.dirname(fileURLToPath(globalThis._importMeta_.url));`;
const TO = `globalThis["__dirname"] = process.cwd();`;

if (content.includes(TO)) {
  console.log("[patch-nitro] 이미 패치됨");
  process.exit(0);
}

if (!content.includes(FROM)) {
  console.warn("[patch-nitro] 대상 라인 못 찾음 — Nuxt/Prisma 버전이 바뀌었을 수 있음. 수동 확인 필요");
  process.exit(1);
}

const patched = content.replace(FROM, TO);
writeFileSync(target, patched, "utf-8");
console.log("[patch-nitro] 패치 완료");
