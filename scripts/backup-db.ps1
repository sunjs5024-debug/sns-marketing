# DB 백업 wrapper — .env 로드 후 node 실행
# Windows 작업 스케줄러에서 매일 실행하도록 등록할 스크립트

$projectRoot = "C:\Users\admin\Desktop\sns-marketing-nuxt"
$envFile = "$projectRoot\.env"
$logDir = "$projectRoot\backups"
$logFile = "$logDir\backup.log"

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

# .env 파싱 후 환경변수로 set
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([A-Z_]+)="?([^"]*)"?$') {
      [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
  }
} else {
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  ❌ .env not found at $envFile" | Add-Content $logFile
  exit 1
}

# node 실행 + stdout/stderr 둘 다 로그에 추가
$ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
"---- $ts backup start ----" | Add-Content $logFile

Set-Location $projectRoot
& npx tsx scripts/backup-db.ts 2>&1 | Tee-Object -FilePath $logFile -Append | Out-Null

if ($LASTEXITCODE -eq 0) {
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  ✅ backup OK" | Add-Content $logFile
} else {
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  ❌ backup FAILED (exit $LASTEXITCODE)" | Add-Content $logFile
}
