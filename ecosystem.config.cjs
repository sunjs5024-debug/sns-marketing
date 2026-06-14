// PM2 ecosystem 설정 — Nuxt prod 서버 자동 관리
//
// 사용법:
//   pm2 start ecosystem.config.cjs     # 시작
//   pm2 status                          # 상태
//   pm2 logs sns-factory                # 로그
//   pm2 restart sns-factory             # 재시작
//   pm2 reload sns-factory              # 무중단 재시작
//   pm2 stop sns-factory                # 중지
//   pm2 save                            # 현재 프로세스 목록 저장
//   pm2 resurrect                       # 저장된 목록 복원 (부팅 시 자동)
//
// 환경변수는 .env 에서 자동 로드되지 않으니까 dotenv-cli 또는 PM2 env 로 주입

require("dotenv").config({ path: __dirname + "/.env" });

module.exports = {
  apps: [
    {
      name: "sns-factory",
      script: ".output/server/index.mjs",
      cwd: __dirname,

      // Windows에서 node 직접 실행
      interpreter: "node",

      // 단일 인스턴스 (Neon Postgres + nuxt-auth 세션은 cluster 모드에서 주의 필요)
      instances: 1,
      exec_mode: "fork",

      // 자동 재시작 정책
      autorestart: true,
      watch: false, // 빌드 파일 watch 안 함
      max_restarts: 50,
      min_uptime: 10000, // 10초 미만 종료 = 비정상 종료로 카운트
      restart_delay: 2000, // 재시작 전 2초 대기

      // 메모리 한계 (초과 시 자동 재시작)
      max_memory_restart: "1500M",

      // 로그 위치
      out_file: "./logs/pm2-out.log",
      error_file: "./logs/pm2-err.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",

      // 환경변수 — .env 에서 로드된 값을 그대로 전달
      env: {
        ...process.env,
        NODE_ENV: "production",
        NUXT_HOST: "127.0.0.1",
        NUXT_PORT: "3000",
      },
    },
  ],
};
