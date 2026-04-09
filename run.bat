@echo off
title NimbusFS Launcher (Node.js)
color 0B

echo.
echo  ███╗   ██╗██╗███╗   ███╗██████╗ ██╗   ██╗███████╗███████╗███████╗
echo  ████╗  ██║██║████╗ ████║██╔══██╗██║   ██║██╔════╝██╔════╝██╔════╝
echo  ██╔██╗ ██║██║██╔████╔██║██████╔╝██║   ██║███████╗█████╗  ███████╗
echo  ██║╚██╗██║██║██║╚██╔╝██║██╔══██╗██║   ██║╚════██║██╔══╝  ╚════██║
echo  ██║ ╚████║██║██║ ╚═╝ ██║██████╔╝╚██████╔╝███████║██║     ███████║
echo  ╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚═════╝  ╚═════╝ ╚══════╝╚═╝     ╚══════╝
echo.
echo  Distributed File System (Node.js) - Starting up...
echo  ==========================================
echo.

REM Navigate to project root
cd /d "%~dp0"

REM --- Check Backend Dependencies ---
if not exist "backend\node_modules\" (
    echo  [SYSTEM] Installing Backend dependencies...
    cd /d "%~dp0backend"
    call npm install
    cd /d "%~dp0"
)

REM --- Check Frontend Dependencies ---
if not exist "frontend\node_modules\" (
    echo  [SYSTEM] Installing Frontend dependencies...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
)

REM --- Start Storage Nodes ---
echo  [1/3] Starting Storage Nodes (Ports 8001-8003)...
start "NimbusFS Node 1" cmd /k "cd /d %~dp0backend && npm run node -- 8001 node1"
start "NimbusFS Node 2" cmd /k "cd /d %~dp0backend && npm run node -- 8002 node2"
start "NimbusFS Node 3" cmd /k "cd /d %~dp0backend && npm run node -- 8003 node3"

REM Short delay for nodes to start
timeout /t 2 /nobreak >nul

REM --- Start Backend ---
echo  [2/3] Starting Main Backend (Node.js on port 8005)...
start "NimbusFS Main Backend" cmd /k "cd /d %~dp0backend && npm run dev"

REM Short delay to let backend spin up first
timeout /t 3 /nobreak >nul

REM --- Start Frontend ---
echo  [3/3] Starting Frontend (Vite on port 3000)...
start "NimbusFS Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

REM Short delay then open browser
timeout /t 4 /nobreak >nul

echo.
echo  ==========================================
echo  NimbusFS is running!
echo  Frontend : http://localhost:3000
echo  Backend  : http://localhost:8005
echo  ==========================================
echo.
echo  Opening browser...
start "" "http://localhost:3000"

echo  Both servers are running in separate windows.
echo  Close those windows to stop the servers.
echo.
pause
