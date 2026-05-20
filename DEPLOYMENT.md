# 배포 가이드 — Cloudflare Pages + Neon Postgres

snsboost.kr 같은 구성으로 `내이름.kr` 도메인까지 한 번에 띄우는 단계별 안내입니다.

## 0. 사전 준비 — 무료 계정 만들기 (10분)

각 사이트에서 GitHub 또는 Google 계정으로 가입하시면 됩니다.

| 서비스 | 용도 | 가입 |
|---|---|---|
| **GitHub** | 코드 저장소 | https://github.com |
| **Neon** | 무료 Postgres DB | https://console.neon.tech |
| **Cloudflare** | 호스팅 + DNS | https://dash.cloudflare.com/sign-up |
| **가비아** 또는 **후이즈** | `.kr` 도메인 구매 | https://gabia.com |

---

## 1. Neon에서 DB 생성 (3분)

1. https://console.neon.tech 가입 → **New Project**
2. Project name: `sns-marketing`, Region: `Asia Pacific (Singapore)` 추천 (한국에서 가장 가까움)
3. 프로젝트 생성 직후 화면에 표시되는 **Connection string** 복사
   - 예: `postgresql://neondb_owner:abc...@ep-cool-mountain-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
4. 로컬 `.env` 의 `DATABASE_URL` 에 붙여넣기

```env
DATABASE_URL="postgresql://neondb_owner:abc...@...neon.tech/neondb?sslmode=require"
```

## 2. 로컬에서 DB 초기화 + 시드 (2분)

프로젝트 폴더에서:

```powershell
cd C:\Users\user1\Desktop\sns-marketing-nuxt

# 스키마를 Neon DB에 적용 (테이블 생성)
npx prisma migrate dev --name init

# 카테고리·상품·관리자 계정 시드
npx tsx prisma/seed.ts

# 동작 확인
npm run dev
```

`http://localhost:3001` 에서 평소처럼 동작. 단 이제 데이터는 Neon 클라우드 DB에 저장됩니다.

---

## 3. GitHub에 코드 푸시 (5분)

```powershell
cd C:\Users\user1\Desktop\sns-marketing-nuxt
git init
git add .
git commit -m "init: SNS marketing site"
```

그다음 GitHub 웹사이트에서:
1. https://github.com/new → 새 저장소 `sns-marketing` 만들기 (Private 권장)
2. 안내된 명령 실행:
   ```powershell
   git remote add origin https://github.com/<당신아이디>/sns-marketing.git
   git branch -M main
   git push -u origin main
   ```

> ⚠ `.gitignore` 에 `.env` 가 들어있어서 비밀키는 푸시되지 않습니다. Neon URL은 노출 안 됨.

---

## 4. Cloudflare Pages 연결 (5분)

1. https://dash.cloudflare.com → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. GitHub 연결 → `sns-marketing` 레포 선택
3. 빌드 설정:
   - **Framework preset**: Nuxt.js
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: 비워두기
4. **Environment variables (Production)** 에 다음 값 입력:

| 키 | 값 |
|---|---|
| `DATABASE_URL` | Neon 연결 문자열 (.env와 동일) |
| `NUXT_AUTH_SECRET` | `.env` 의 값 그대로 |
| `NEXTAUTH_URL` | 실제 배포 URL (예: `https://sns-marketing.pages.dev`) |
| `NODE_VERSION` | `20` |

5. **Save and Deploy** → 빌드 자동 진행 (3~5분)
6. 완료되면 `https://sns-marketing.pages.dev` 같은 URL이 발급됨

---

## 5. `.kr` 도메인 구입 + 연결 (15~30분)

### 5-1. 가비아에서 도메인 구매
1. https://gabia.com → 도메인 검색
2. `원하는이름.kr` (또는 `.co.kr`) 구매 — 약 22,000원/년
3. 결제 후 도메인 관리 페이지에서 **네임서버 변경** 메뉴 진입

### 5-2. Cloudflare에 도메인 추가
1. https://dash.cloudflare.com → **Add a site** → 구매한 도메인 입력
2. 무료 플랜 선택
3. Cloudflare가 표시하는 **네임서버 2개** 복사 (예: `nash.ns.cloudflare.com`, `tia.ns.cloudflare.com`)

### 5-3. 가비아에 Cloudflare 네임서버 입력
1. 가비아 도메인 관리 → **네임서버 변경** 
2. Cloudflare 네임서버 2개 입력 → 저장
3. 1~24시간 후 DNS 전파 완료 (보통 30분 내)

### 5-4. Cloudflare Pages에 도메인 연결
1. Cloudflare Pages → 프로젝트 → **Custom domains** → **Set up a custom domain**
2. `내이름.kr` 입력 → SSL 자동 발급
3. 끝! `https://내이름.kr` 접속 가능

### 5-5. 도메인 변경 후 환경변수 갱신
Cloudflare Pages 환경변수에서:
```
NEXTAUTH_URL = https://내이름.kr
```
저장 → **Retry deployment** 클릭

---

## 6. 소셜 로그인 실키 등록 (선택, 30분)

OAuth 키 입력하면 카카오/네이버/구글 로그인 활성화됩니다.

| 플랫폼 | 콜백 URL (Redirect URI) |
|---|---|
| 카카오 | `https://내이름.kr/api/auth/callback/kakao` |
| 네이버 | `https://내이름.kr/api/auth/callback/naver` |
| 구글 | `https://내이름.kr/api/auth/callback/google` |

각 개발자 콘솔에서 위 URL을 등록한 뒤 Cloudflare Pages 환경변수에:
```
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 7. 실제 결제 연결 (사업자등록 후)

1. 사업자등록증 발급 (홈택스 - 무료)
2. 통신판매업 신고 (정부24 - 4~5만원)
3. 포트원(PortOne) 가입 + PG사 계약
4. Cloudflare Pages 환경변수에:
```
PORTONE_STORE_ID=...
PORTONE_API_SECRET=...
NUXT_PUBLIC_PORTONE_CHANNEL_KEY=...
```
5. `app/pages/checkout/[orderNumber]/pay.vue` 의 mock 버튼을 PortOne v2 SDK 호출로 교체 (별도 작업)

---

## 💡 자주 묻는 질문

**Q. 비용은?**
- Neon: 500MB까지 무료, 그 이상 월 $19~
- Cloudflare Pages: 100,000 요청/일 무료
- 도메인: 약 2.2만원/년
- **시작 비용: 도메인값 22,000원만**

**Q. snsboost.kr과 정확히 같은 구성인가요?**
네. 동일한 Nuxt + Cloudflare 패턴이고, DB는 Neon Postgres (snsboost는 정확히 어느 DB인지 비공개라 추정).

**Q. DB 데이터를 다시 옮기려면?**
시드는 멱등성이라 `npx tsx prisma/seed.ts` 만 다시 돌리면 됩니다. 사용자/주문 데이터는 Neon Console의 SQL Editor에서 직접 보거나 백업 가능합니다.

**Q. 배포 후 코드 수정 반영은?**
GitHub `main` 브랜치에 푸시하면 Cloudflare Pages가 자동으로 빌드/배포합니다 (CI/CD 내장).
