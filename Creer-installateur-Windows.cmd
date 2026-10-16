@echo off
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo Installez Node.js 24 LTS puis relancez ce fichier.
  pause
  exit /b 1
)
if not exist node_modules\electron\dist\electron.exe (
  call npm ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
call npm run build:win
if errorlevel 1 (
  pause
  exit /b 1
)
explorer release
pause
