// Cloudflare 엣지 캐시 퍼지 — 배포/가격·품절 변경 후 즉시 반영용.
//   전체:   node scripts/cf-purge.mjs
//   URL별:  node scripts/cf-purge.mjs https://sns늘리기.kr/products/kko-channel-add /sns/kakaotalk
//   (경로만 줘도 됨 — 자동으로 도메인 붙임)
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const g = (k) => env.split(/\r?\n/).find((l) => l.startsWith(k + "="))?.slice(k.length + 1).replace(/^["']|["']$/g, "");
const TOKEN = g("CLOUDFLARE_API_TOKEN"), ZONE = g("CLOUDFLARE_ZONE_ID");
if (!TOKEN || !ZONE) { console.error("❌ .env에 CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID 필요"); process.exit(1); }

const BASE = "https://xn--sns-yg9lh0pw9l.kr";
const args = process.argv.slice(2);
const body = args.length
  ? { files: args.map((u) => (u.startsWith("http") ? u : BASE + (u.startsWith("/") ? u : "/" + u))) }
  : { purge_everything: true };

const r = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE}/purge_cache`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
}).then((x) => x.json());

if (r.success) console.log("✅ 캐시 퍼지 완료:", args.length ? args.join(", ") : "전체");
else { console.error("❌ 퍼지 실패:", JSON.stringify(r.errors)); process.exit(1); }
