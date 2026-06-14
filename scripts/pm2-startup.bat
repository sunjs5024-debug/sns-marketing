@echo off
REM SNS소셜팩토리 자동 시작 스크립트 (PM2 부활)
REM - Windows 작업 스케줄러에 의해 사용자 로그온 시 자동 실행
REM - PM2 데몬을 띄우고 저장된 프로세스 목록 복원

cd /d C:\Users\admin\Desktop\sns-marketing-nuxt
call pm2 resurrect
exit /b
