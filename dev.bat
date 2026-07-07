@echo off
start "Next.js Dev Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
start "Electron" cmd /k "npm run electron:dev"
