@echo off
chcp 65001 >nul
title Claude Code - SNS소셜팩토리
cd /d "C:\Users\admin\Desktop\sns-marketing-nuxt"
"C:\Users\admin\.local\bin\claude.exe" %*
echo.
echo [Claude 세션이 종료되었습니다. 창을 닫으려면 아무 키나 누르세요.]
pause >nul
