@echo off
setlocal
cd /d "%~dp0"

echo.
echo === Suii ATS (separate from Northline) ===
echo This window must stay open. Chrome will open http://127.0.0.1:3002
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed or not on PATH.
  echo Install the LTS build from https://nodejs.org then run this file again.
  echo.
  pause
  exit /b 1
)

if not exist ".env" copy /y ".env.example" ".env" >nul

echo Installing dependencies...
call npm install
if errorlevel 1 (
  echo npm install failed.
  pause
  exit /b 1
)

echo Preparing Suii database...
call npx prisma generate
call npx prisma db push
call npm run db:seed

echo Starting Suii ATS on http://127.0.0.1:3002 ...
start "" cmd /c "timeout /t 10 /nobreak >nul && start http://127.0.0.1:3002"

call npx next dev -H 127.0.0.1 -p 3002
echo.
echo Suii server stopped.
pause
