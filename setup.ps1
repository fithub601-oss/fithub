# FITHUB Setup Script
# Run this after installing Node.js
# This script installs all dependencies

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "    FITHUB Setup - MERN Stack" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVer = node --version
    Write-Host "[OK] Node.js $nodeVer detected" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[1/3] Installing root dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "[2/3] Installing backend dependencies..." -ForegroundColor Yellow
Push-Location server
npm install
Pop-Location

Write-Host ""
Write-Host "[3/3] Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location client
npm install
Pop-Location

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Configure MongoDB connection in 'server\.env'"
Write-Host "     (Edit the .env file with your MongoDB Atlas URL)"
Write-Host "  2. Seed sample data & admin account:"
Write-Host "     cd server; npm run seed"
Write-Host "  3. Start the app:"
Write-Host "     npm start"
Write-Host ""
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend:  http://localhost:5000"
Write-Host "  Admin login: admin@fithub.com / admin123"
Write-Host ""
Read-Host "Press Enter to exit"
