@echo off
echo Starting Blockchain Forensics App...

echo Starting Backend (FastAPI)...
start "Backend" cmd /k "cd backend && uvicorn main:app --reload --port 8007"

echo Starting Frontend (Vite)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo App started! 
echo Backend: http://localhost:8007
echo Frontend: http://localhost:5173
pause
