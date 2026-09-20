@echo off
echo.
echo  ✨ THE MIRROR — Starting server...
echo.

:: Check if API key is set
if "%ANTHROPIC_API_KEY%"=="" (
  echo  ⚠️  ANTHROPIC_API_KEY not set.
  echo  Set it with: set ANTHROPIC_API_KEY=sk-ant-...
  echo  Or paste your key in the UI when prompted.
  echo.
)

:: Try Python server
python --version >nul 2>&1
if %ERRORLEVEL% == 0 (
  echo  Starting Python server on http://localhost:3001
  echo  Open your browser at: http://localhost:3001
  echo.
  python server\server.py
  goto :end
)

:: Try Node.js
node --version >nul 2>&1
if %ERRORLEVEL% == 0 (
  echo  Starting Node.js server on http://localhost:3001
  cd server
  npm install --silent
  node index.js
  goto :end
)

echo  ERROR: Neither Python nor Node.js found. Please install one.
echo  Python: https://python.org
echo  Node.js: https://nodejs.org

:end
pause
