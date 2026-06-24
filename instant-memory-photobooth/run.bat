@echo off
cd /d "%~dp0"
echo Dang chay Instant Memory Photobooth...
echo Trinh duyet se mo tai: http://127.0.0.1:4173/
start http://127.0.0.1:4173/
where py >nul 2>nul
if %errorlevel%==0 (
    py -3 -m http.server 4173 --bind 127.0.0.1
) else (
    python -m http.server 4173 --bind 127.0.0.1
)
pause
