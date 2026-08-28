// IndexNow — 새/변경된 URL을 빙 등 검색엔진에 즉시 색인 통보.
//   node scripts/indexnow.mjs                         (기본 핵심 URL)
//   node scripts/indexnow.mjs /sns/kakaotalk /guide/kakaotalk-channel
//   node scripts/indexnow.mjs https://.../products/kko-channel-add
const KEY = "a2b55799d15af463c1c1e68ad4b14663";
const HOST = "xn--sns-yg9lh0pw9l.kr";
const BASE = `https://${HOST}`;
// 기본 = 카카오 신규 클러스터 + 주요 진입점
const DEFAULTS = [
  "/", "/sns/kakaotalk", "/guide/kakaotalk-channel",
  "/products/kko-channel-add", "/products/kko-open-join",
  "/products/kko-open-like", "/products/kko-post-like",
];
const args = process.argv.slice(2);
const urlList = (args.length ? args : DEFAULTS).map((u) =>
  u.startsWith("http") ? u : BASE + (u.startsWith("/") ? u : "/" + u)
);
const body = { host: HOST, key: KEY, keyLocation: `${BASE}/${KEY}.txt`, urlList };
const r = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
const ok = r.status === 200 || r.status === 202;
console.log(`IndexNow ${r.status} ${ok ? "✅ 제출됨" : "⚠️ 확인필요"} (${urlList.length}개 URL)`);
if (!ok) console.log(await r.text());
