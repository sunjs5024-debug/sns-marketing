# SNS소셜팩토리 - 프로젝트 메모

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
- **`sitemap.xml`** — `@nuxtjs/sitemap` 모듈 도입 검토. 새 페이지 추가 시 자동 등록.
- **`robots.txt`** — 크롤링 허용 + sitemap 위치 명시.
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

---

## 운영 환경 (중요)

이 사이트는 **이 Windows PC에서 직접 서빙**된다. 클라우드 호스팅 아님.

```
브라우저
  → Cloudflare (DNS + CDN, 104.21.5.123 / 172.67.133.113)
    → 이 PC 공인 IP
      → Apache (XAMPP, C:\xampp, 80/443 포트)
        → 리버스 프록시 http://127.0.0.1:3000/
          → Nuxt 4 dev 서버
            → Neon Postgres (원격 DB)
```

- **도메인**: `xn--sns-yg9lh0pw9l.kr` (퓨니코드, 한글 도메인)
- **Apache 설정**: `C:\xampp\apache\conf\extra\httpd-vhosts.conf` 에 `ProxyPass / http://127.0.0.1:3000/`
- **Nuxt 띄우는 법** (PC 켤 때마다 필요):
  ```powershell
  cd C:\Users\admin\Desktop\sns-marketing-nuxt
  npx nuxt dev --host 127.0.0.1 --port 3000
  ```
- ⚠️ **반드시 `--host 127.0.0.1`** — 안 하면 IPv6(`::1`)에만 바인딩돼서 Apache가 못 닿아 503 뜸.
- 창 닫으면 사이트 다운. 백그라운드로 띄우려면 PM2 또는 Windows 서비스로 등록 검토.

## 스택
- Nuxt 4.4.6 + Vue 3 + Tailwind 4 + TypeScript
- Prisma 7 (Postgres) + Neon adapter + `@sidebase/nuxt-auth`
- Nitro preset: `cloudflare-pages` (예전 잔재, 지금은 노드 dev 모드로 운영 중)

## GitHub
- 레포: `sunjs5024-debug/sns-marketing`
- 본인 계정: `sunjs5024-debug` (브라우저에 다른 계정 `pjw502411-design`도 로그인돼 있어 PAT/푸시 시 계정 혼동 주의)
- 푸시 안 된 로컬 커밋: `850dff2` (브랜드 리네임)

## 브랜드
- 현재 브랜드: **SNS소셜팩토리** (구: 부스터마켓)
- 로고 글자: **S** (구: B), 그라데이션 인디고→퍼플→핑크 유지
