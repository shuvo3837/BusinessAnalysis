@echo off
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --no-sandbox --dump-dom --virtual-time-budget=8000 "http://localhost:3000/login" > "C:\projects\BusinessAnalysis\live-dom.html" 2>nul
