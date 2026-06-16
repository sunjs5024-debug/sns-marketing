// 배포 후 SEO 스모크 테스트 — 라이브(또는 로컬) URL을 직접 때려 회귀 검증.
// 사용법:  node scripts/seo-smoke.mjs [baseUrl]
//   기본 baseUrl = http://127.0.0.1:3000
//   예) node scripts/seo-smoke.mjs https://xn--sns-yg9lh0pw9l.kr
//
// 종료코드: 모든 필수 검사 통과 = 0, 하나라도 실패 = 1.
// DB 장애로 막힌 검사는 BLOCKED 로 구분 표기하되 실패(코드 1)로 집계.

const BASE = (process.argv[2] || process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

let pass = 0;
let fail = 0;
let blocked = 0;
const rows = [];
function record(status, name, detail = "") {
  rows.push({ status, name, detail });
  if (status === "PASS") pass++;
  else if (status === "BLOCKED") blocked++;
  else fail++;
}

async function get(path, { redirect = "manual" } = {}) {
  const url = path.startsWith("http") ? path : BASE + path;
  try {
    const res = await fetch(url, { redirect, headers: { "user-agent": "seo-smoke/1.0" } });
    // 에러 응답(4xx/5xx)도 본문을 읽어야 health 503 JSON 등을 판별할 수 있다.
    const body = await res.text().catch(() => "");
    return { status: res.status, body, headers: res.headers };
  } catch (e) {
    return { status: 0, body: "", headers: new Headers(), error: String(e?.message || e) };
  }
}

const tag = (h, re) => (h.match(re)?.[1] || "").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 라이브(Cloudflare/엣지) 버스트 차단 회피용 — 429면 Retry-After(없으면 점증 백오프) 만큼 기다렸다 최대 3회 재시도.
async function getPolite(path, opts) {
  let r = await get(path, opts);
  for (let attempt = 1; attempt <= 3 && r.status === 429; attempt++) {
    const wait = Math.min(15, Number(r.headers.get?.("retry-after")) || attempt * 5);
    await sleep(wait * 1000);
    r = await get(path, opts);
  }
  return r;
}

async function run() {
  console.log(`\n=== SEO 스모크 테스트 @ ${BASE} ===\n`);

  // 1) 홈 200
  {
    const r = await get("/");
    record(r.status === 200 ? "PASS" : "FAIL", "홈페이지 200", `status=${r.status}`);
  }

  // 2) 대표 상품 slug 동적 확보 (DB 의존)
  let productSlug = null;
  {
    const r = await get("/api/products/by-platform/instagram");
    if (r.status === 200) {
      try {
        const arr = JSON.parse(r.body);
        productSlug = arr?.[0]?.slug ?? null;
        record(arr.length >= 1 ? "PASS" : "FAIL", "/sns/instagram 상품 1개 이상(API)", `count=${arr.length}`);
      } catch {
        record("FAIL", "/sns/instagram 상품 1개 이상(API)", "JSON 파싱 실패");
      }
    } else {
      record(r.status === 503 ? "BLOCKED" : "FAIL", "/sns/instagram 상품 1개 이상(API)", `API status=${r.status}`);
    }
  }

  // 2b) /sns/instagram 페이지 — DB 정상이면 200, 장애면 503(0개 200 금지)
  {
    const r = await get("/sns/instagram");
    if (productSlug) record(r.status === 200 ? "PASS" : "FAIL", "/sns/instagram 페이지 200", `status=${r.status}`);
    else record(r.status === 503 ? "BLOCKED" : "FAIL", "/sns/instagram 페이지(DB장애시 503)", `status=${r.status}`);
  }

  // 3) 대표 상품 페이지 200 + title/description/canonical/H1
  if (productSlug) {
    const r = await get(`/products/${productSlug}`);
    if (r.status === 200) {
      const title = tag(r.body, /<title>(.*?)<\/title>/s);
      const desc = tag(r.body, /name="description"\s+content="([^"]*)"/);
      const canon = tag(r.body, /rel="canonical"[^>]*href="([^"]*)"/);
      const h1 = tag(r.body, /<h1[^>]*>(.*?)<\/h1>/s).replace(/<[^>]+>/g, "").trim();
      const ok = title && desc && canon && h1;
      record(ok ? "PASS" : "FAIL", `대표 상품 /products/${productSlug} 200+메타`, `title=${!!title} desc=${!!desc} canon=${!!canon} h1=${!!h1}`);
    } else {
      record("FAIL", `대표 상품 /products/${productSlug}`, `status=${r.status}`);
    }
  } else {
    record("BLOCKED", "대표 상품 페이지 200+메타", "상품 slug 확보 실패(DB 장애)");
  }

  // 4) 대표 가이드 200 (DB 비의존)
  {
    const r = await get("/guide/instagram-followers");
    record(r.status === 200 ? "PASS" : "FAIL", "대표 가이드 200", `status=${r.status}`);
  }

  // 5) 존재하지 않는 가이드 404
  {
    const r = await get("/guide/__nope__zzz");
    record(r.status === 404 ? "PASS" : "FAIL", "없는 가이드 404", `status=${r.status}`);
  }

  // 6) 존재하지 않는 상품 — DB 정상이면 404, 장애면 503(soft-404 금지)
  {
    const r = await get("/products/__nope__zzz");
    if (productSlug) record(r.status === 404 ? "PASS" : "FAIL", "없는 상품 404", `status=${r.status}`);
    else record(r.status === 503 ? "BLOCKED" : "FAIL", "없는 상품(DB장애시 503)", `status=${r.status}`);
  }

  // 7) 사이트맵 200 (DB 장애 중엔 503 의도됨)
  let sitemapOk = false;
  let locs = [];
  {
    const r = await get("/sitemap.xml");
    sitemapOk = r.status === 200;
    if (sitemapOk) {
      locs = [...r.body.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
      record("PASS", "sitemap.xml 200", `loc=${locs.length}`);
    } else if (r.status === 503) {
      record("BLOCKED", "sitemap.xml (DB장애시 503)", "status=503");
    } else {
      record("FAIL", "sitemap.xml", `status=${r.status}`);
    }
  }

  // 8) 사이트맵에 /products/ 포함 (사이트맵이 200일 때만 평가)
  if (sitemapOk) {
    const productLocs = locs.filter((l) => /\/products\//.test(l));
    record(productLocs.length >= 1 ? "PASS" : "FAIL", "사이트맵에 /products/ URL 포함", `productLocs=${productLocs.length}`);
  } else {
    record("BLOCKED", "사이트맵에 /products/ URL 포함", "사이트맵 미발행(DB 장애 503)");
  }

  // 9) 사이트맵 제외 확인: /search /mypage /rank
  if (sitemapOk) {
    const bad = locs.filter((l) => /\/(search|mypage|rank)(\/|$|\?)/.test(l));
    record(bad.length === 0 ? "PASS" : "FAIL", "사이트맵 제외(/search,/mypage,/rank)", bad.length ? `위반=${bad.join(",")}` : "없음");
  } else {
    record("BLOCKED", "사이트맵 제외(/search,/mypage,/rank)", "사이트맵 미발행(DB 장애 503)");
  }

  // 10) 사이트맵 모든 loc 상태코드 (200 또는 의도된 리다이렉트)
  if (sitemapOk && locs.length) {
    const bad = [];
    for (const l of locs) {
      const p = l.replace(/^https?:\/\/[^/]+/, "");
      // 엣지 rate-limit 회피: 요청 간 간격 + 429 시 재시도
      await sleep(600);
      const r = await getPolite(p, { redirect: "manual" });
      if (!(r.status === 200 || (r.status >= 300 && r.status < 400))) bad.push(`${r.status} ${p}`);
    }
    record(bad.length === 0 ? "PASS" : "FAIL", `사이트맵 loc 전수 상태(${locs.length}개)`, bad.length ? bad.join(" | ") : "전부 200/redirect");
  } else if (sitemapOk) {
    record("FAIL", "사이트맵 loc 전수 상태", "loc 0개");
  } else {
    record("BLOCKED", "사이트맵 loc 전수 상태", "사이트맵 미발행(DB 장애 503)");
  }

  // 11) robots.txt 에 sitemap 주소
  {
    const r = await get("/robots.txt");
    const ok = r.status === 200 && /Sitemap:\s*\S+sitemap\.xml/i.test(r.body);
    record(ok ? "PASS" : "FAIL", "robots.txt 에 Sitemap 주소", r.status === 200 ? (ok ? "있음" : "없음") : `status=${r.status}`);
  }

  // 12) DB 헬스체크 엔드포인트
  {
    await sleep(250);
    const r = await getPolite("/api/health/db");
    let parsed = {};
    try { parsed = JSON.parse(r.body || "{}"); } catch {}
    if (r.status === 200 && parsed.ok === true) record("PASS", "/api/health/db (정상)", "ok=true");
    else if (r.status === 503 && parsed.ok === false) record("BLOCKED", "/api/health/db (DB 장애 503)", "ok=false");
    else record("FAIL", "/api/health/db", `status=${r.status}`);
  }

  // 결과 출력
  console.log("STATUS   | 검사 | 상세");
  console.log("---------+------+------");
  for (const r of rows) console.log(`${r.status.padEnd(8)} | ${r.name} | ${r.detail}`);
  console.log(`\n요약: PASS=${pass}  FAIL=${fail}  BLOCKED=${blocked}  (BASE=${BASE})`);
  if (blocked) console.log("※ BLOCKED = DB 장애(Neon 쿼터)로 검증 불가. DB 복구 후 재실행 필요.");
  process.exit(fail + blocked > 0 ? 1 : 0);
}

run();
