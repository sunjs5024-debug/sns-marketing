' SNS소셜팩토리 자동 시작 (콘솔 창 숨김)
' Windows 시작프로그램 폴더에 두면 로그온 시 자동 실행됨

Set WshShell = CreateObject("WScript.Shell")
WshShell.Run """C:\Users\admin\Desktop\sns-marketing-nuxt\scripts\pm2-startup.bat""", 0, False
