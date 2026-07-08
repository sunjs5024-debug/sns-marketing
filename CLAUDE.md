# SNS소셜팩토리 - 프로젝트 메모

> **세팅·지뢰목록·배포 절차의 원본 문서는 [ONBOARDING.md](ONBOARDING.md). 이 파일과 충돌하면 ONBOARDING.md가 진실.**

## 운영 환경 (2026-07 현행)

```
방문자 → Cloudflare Pages (엣지 서버리스, main 푸시 시 자동 빌드·배포 5~7분)
           └─ Nuxt 4 (프론트 + server/api 백엔드)
                └─ Neon PostgreSQL (클라우드 DB, Prisma 6 + Neon 어댑터)
```

- **도메인**: `xn--sns-yg9lh0pw9l.kr` (= sns늘리기.kr, 한글 도메인 퓨니코드)
- **별도 서버 없음.** ~~자택 PC XAMPP/PM2 직접 서빙~~ 은 폐지된 옛 구조 (`pc-backup` 브랜치에 보존, 건드리지 말 것)
- **`git push origin main` = 실서비스 즉시 배포.** 확신 없는 변경은 `feature/*` 브랜치에서 작업 후 검토·머지가 기본.
- 운영 환경변수: Cloudflare Pages → 설정 → 변수 및 비밀 (수정 후 재배포해야 반영)

## 스택

- Nuxt 4 + Vue 3 + Tailwind 4 + TypeScript
- **Prisma 6.x 고정 (7 업그레이드 금지 — Cloudflare에서 WASM 컴파일 차단)** + Neon adapter
- Nitro preset: `cloudflare_pages` / 인증: @sidebase/nuxt-auth + 수동 OAuth (지뢰 목록 참고)

## 로컬 개발 (Windows)

```powershell
npm install     # postinstall: nuxt prepare + prisma generate
npm run dev     # http://localhost:3000 (.env 필요 — 깃허브에 없음, 관리자에게 수령)
```

- ⚠️ **Windows 전용 지뢰**: Nitro dev가 Prisma workerd 클라이언트의 `query_engine_bg.js` 동적 import 경로를 `C:\generated\...`(드라이브 루트)로 잘못 계산해 DB가 unavailable로 뜬다.
  **해법**: `New-Item -ItemType Junction -Path C:\generated -Target <프로젝트>\generated` 정션 생성 후 dev 서버 재시작. (리눅스/맥·Cloudflare 빌드는 무관)
- 엣지 특유 동작(OAuth 콜백 등) 검증: `npm run build` 후 `npx wrangler pages dev dist` (ONBOARDING.md §2)

## 지뢰 목록 (요약 — 상세는 ONBOARDING.md §4)

1. package-lock.json 커밋 금지 (gitignore 됨 — 리눅스 빌드 깨짐)
2. Prisma 6.x 고정, 업그레이드 금지
3. prisma client는 요청별 생성 (`server/utils/prisma.ts`) — 싱글톤으로 되돌리면 죽음
4. 소셜 로그인은 수동 OAuth (`server/utils/oauth.ts`) — 와일드카드 콜백 라우트 만들지 말 것
5. `shims/hkdf.cjs` 지우면 로그인 전체가 죽음
6. 공개 페이지·카탈로그 API는 SWR 엣지캐시 10분 — 수정 반영 지연은 정상
7. DB는 운영 공용(Neon) — 스키마 변경 신중히 (`npx prisma migrate dev`)

## GitHub

- 레포: `sunjs5024-debug/sns-marketing` / 본인 계정: `sunjs5024-debug`
- (브라우저에 다른 계정 `pjw502411-design`도 로그인돼 있어 계정 혼동 주의)

## 브랜드

- 현재 브랜드: **SNS소셜팩토리** (구: 부스터마켓)
- 로고 글자: **S**, 그라데이션 인디고→퍼플→핑크 유지

---

## ⚠️ 작업할 때 항상 지킬 것 — SEO & 상위노출 최우선

이 사이트는 **SNS 마케팅 / 검색 상위노출 영업**용 홈페이지다. 어떤 코드/문구/구조 수정이든 다음을 먼저 고려한다:

### SEO 체크리스트 (모든 페이지 추가/수정 시)
- **`<title>` 태그** — 핵심 키워드 포함, 60자 이내. 페이지마다 고유하게.
- **`<meta name="description">`** — 150자 내외, 키워드 자연스럽게 포함, 클릭 유도 문구.
- **`<h1>`** — 페이지당 1개, 키워드 포함.
- **`<h2>`/`<h3>`** — 시맨틱 계층 유지, 키워드 자연 분포.
- **이미지 `alt`** — 모든 `<img>`/`<NuxtImg>`에 alt 필수. 장식용이면 `alt=""`.
- **`<a>` 텍스트** — "여기 클릭" 금지. 링크 텍스트에 의도/키워드 담기.
- **내부 링크** — 관련 페이지끼리 상호 링크 (예: 인스타 페이지 ↔ 인스타 후기).
- **URL 구조** — 한글/특수문자 피하고 짧고 의미 있는 영문 슬러그 (`/sns/instagram` ○).
- **메타 robots** — 노출시킬 페이지는 `index,follow`, 비공개는 `noindex`.

### 상위노출 강화 요소 (Nuxt에서 적극 활용)
- **`useSeoMeta` / `useHead`** — 모든 페이지에 SSR 메타 주입. CSR-only 메타는 크롤러가 못 읽음.
- **Open Graph + Twitter Card** — `og:title`, `og:description`, `og:image`, `twitter:card`. SNS 공유 시 노출.
- **JSON-LD 구조화 데이터** — `Organization`, `BreadcrumbList`, `Product`, `FAQPage`, `Review` 적극 삽입. 구글 리치 결과 노출률 ↑.
- **로딩 성능 (Core Web Vitals)** — LCP, INP, CLS 점수가 랭킹 영향. 이미지 lazy, 폰트 preload, 큰 JS 분리.
- **모바일 우선** — 한국 SNS 트래픽 모바일 비중 높음. 반응형 + 모바일 LCP 우선.
- **한국어 검색 최적화** — 네이버/다음 노출도 고려. 키워드 자연스러운 한국어 표현 우선 (영어 키워드 단순 직역 ✕).

### 콘텐츠 작업 원칙
- 카테고리/상품 페이지 추가 시: 제품 설명 300자+ (얇은 콘텐츠는 검색에서 손해).
- 후기/FAQ 페이지: 실제 사용자 검색 쿼리 기반으로 작성 (예: "인스타 팔로워 늘리는법", "유튜브 구독자 사는법").
- 페이지 추가하면 항상 메타 + h1 + JSON-LD 세트로 묶어서 작업.

### 새 페이지/컴포넌트 작업 시 자동 체크
사용자가 SEO 명시적으로 안 시켜도 위 체크리스트는 **기본 적용**한다.
빠진 부분 있으면 작업 마무리에 "SEO 보완할 거: ..." 형태로 알린다.
