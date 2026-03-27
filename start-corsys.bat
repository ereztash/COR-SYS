@echo off
title COR-SYS
cd /d "C:\Users\97252\OneDrive\שולחן העבודה\cor-sys"

echo Starting COR-SYS...
start "" cmd /k "npm run dev"

timeout /t 4 /nobreak >nul
start "" "http://localhost:3000"
