# 개발 온보딩 가이드 — SNS소셜팩토리

새로 합류한 개발자가 로컬 세팅부터 배포까지 따라하는 문서.

## 0. 큰 그림 (아키텍처)

```
방문자 → Cloudflare Pages (엣지 서버리스, main 푸시 시 자동 배포)
           └─ Nuxt 4 (프론트 + server/api 백엔드)
                └─ Neon PostgreSQL (클라우드 DB, Prisma 6 + Neon 어댑터)
```

- **레포**: `sunjs5024-debug/sns-marketing`
- **운영 도메인**: https://xn--sns-yg9lh0pw9l.kr (sns늘리기.kr)
- **배포**: `main` 브랜치에 푸시하면 Cloudflare Pages 가 자동 빌드·배포 (5~7분)
- **`pc-backup` 브랜치**: 예전 자택 PC(node-server) 시절 원본. 건드리지 말 것 (비상 복구용)

## 1. 준비물

| 항목 | 비고 |
|---|---|
| Git | https://git-scm.com |
| Node.js 20+ (LTS) | https://nodejs.org |
| GitHub 계정 | 레포 관리자에게 Collaborator 초대 요청 |
| `.env` 파일 | **깃허브에 없음.** 관리자에게 보안 채널(USB 등)로 직접 받기 |

## 2. 로컬 세팅

```powershell
git clone https://github.com/sunjs5024-debug/sns-marketing.git
cd sns-marketing

# 받은 .env 파일을 프로젝트 루트에 넣기 (.env)

npm install          # postinstall 에서 nuxt prepare + prisma generate 자동 실행
npm run dev          # http://localhost:3000 개발 서버
```

- `npm run dev` 는 Node 기반 개발 서버라 대부분의 작업(화면·API)은 이걸로 충분.
- **엣지(Cloudflare) 특유 동작**(OAuth 콜백·wasm·요청격리 등)을 검증할 땐:
  ```powershell
  npm run build
  npx wrangler pages dev dist --port 8788 --compatibility-date 2026-05-20
  ```
  `.env` 를 복사한 `.dev.vars` 파일이 있으면 wrangler 가 환경변수로 읽음.

## 3. 배포

```powershell
git add -A
git commit -m "설명"
git push origin main   # ← 이게 곧 실서비스 배포다
```

⚠️ **main 푸시 = 실서비스 즉시 반영.** 확신 없는 변경은 브랜치에서:

```powershell
git checkout -b feature/작업명
# ...수정...
git push origin feature/작업명   # 배포 안 됨. 검토 후 main 에 머지
```

## 4. 꼭 알아야 하는 지뢰들 (과거에 실제 터졌던 것)

1. **package-lock.json 은 gitignore 됨** — Windows 에서 만든 lock 에 리눅스 네이티브 모듈이 빠져 Cloudflare 빌드가 깨짐. 커밋하지 말 것.
2. **Prisma 는 6.x 고정** — Prisma 7 은 Cloudflare 에서 WASM 런타임 컴파일 차단으로 동작 불가. 업그레이드 금지.
3. **prisma client 는 요청별 생성** (`server/utils/prisma.ts`) — Cloudflare 는 요청 간 I/O 공유 금지. 모듈 스코프 싱글톤으로 되돌리면 죽는다.
4. **next-auth 소셜 로그인은 수동 OAuth** (`server/utils/oauth.ts` + `/api/oauth/[provider]` + `/api/auth/callback/{kakao,naver,google}.get.ts`) — next-auth v4 의 openid-client 가 엣지에서 안 돌아 직접 구현했다. `callback/[provider]` 같은 와일드카드 라우트를 만들면 credentials 콜백과 충돌하니 주의.
5. **@panva/hkdf 는 shim** (`shims/hkdf.cjs`, nuxt.config `nitro.alias`) — 지우면 로그인 전체가 죽는다.
6. **공개 페이지·카탈로그 API 는 SWR 엣지 캐싱** (nuxt.config `routeRules`, 10분) — 상품/가격 수정이 화면 반영까지 최대 10분 걸리는 건 정상.
7. **DB 스키마 변경** 은 `npx prisma migrate dev` 사용. DB 는 운영 공용(Neon)이라 신중히.

## 5. 운영 부속

- **cron**: GitHub Actions (`.github/workflows/`) — urpanel 주문동기화 5분, 매출요약, 업타임 체크
- **입금 자동매칭**: 폰 SMS 포워더 → `/api/charge/webhook/sms` (X-SMS-Token 헤더)
- **자동 발주**: 결제 확인 시 urpanel 로 발주 (`server/utils/smm-dispatch.ts`)
- **관리자 콘솔**: `/admin` (계정 role=ADMIN 필요)

## 6. 비밀 관리 수칙

- `.env`·`.dev.vars` 는 절대 커밋·공개채팅 전송 금지 (gitignore 돼 있음)
- 운영 환경변수는 Cloudflare Pages → 설정 → 변수 및 비밀 (수정 후 재배포해야 반영)
- 팀원이 나가면 DB 비번·API 키 교체할 것
