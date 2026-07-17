@echo off
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --no-sandbox --window-size=1440,900 --screenshot="C:\projects\BusinessAnalysis\login-screenshot.png" --virtual-time-budget=10000 "http://localhost:3000/login" 2>nul
echo Done
