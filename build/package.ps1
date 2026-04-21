# LocalGateway Portable Package Builder
# Usage: powershell -File build/package.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$OutputDir   = Join-Path $ProjectRoot "build\portable\LocalGateway"

Write-Host "=== LocalGateway Portable Package Builder ===" -ForegroundColor Cyan

# Step 1: Build frontend
Write-Host "[1/4] Building frontend..." -ForegroundColor Yellow
Push-Location (Join-Path $ProjectRoot "web\admin")
npm install --quiet
npm run build
Pop-Location

# Step 2: Copy frontend to embed dir
Write-Host "[2/4] Copying frontend assets to embed dir..." -ForegroundColor Yellow
$EmbedDir = Join-Path $ProjectRoot "build\embed\admin"
if (Test-Path $EmbedDir) { Remove-Item $EmbedDir -Recurse -Force }
New-Item -ItemType Directory -Path $EmbedDir -Force | Out-Null
Copy-Item -Path (Join-Path $ProjectRoot "web\admin\dist\*") -Destination $EmbedDir -Recurse -Force

# Step 3: Build Go binary
Write-Host "[3/4] Building Go binary..." -ForegroundColor Yellow
Push-Location $ProjectRoot
go build -o localgateway.exe ./cmd/localgateway
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed!" -ForegroundColor Red; exit 1 }
Pop-Location

# Step 4: Assemble portable package
Write-Host "[4/4] Assembling portable package..." -ForegroundColor Yellow
if (Test-Path $OutputDir) { Remove-Item $OutputDir -Recurse -Force }
New-Item -ItemType Directory -Path "$OutputDir\data" -Force | Out-Null
New-Item -ItemType Directory -Path "$OutputDir\logs" -Force | Out-Null

Copy-Item (Join-Path $ProjectRoot "localgateway.exe") $OutputDir -Force
Copy-Item (Join-Path $ProjectRoot "configs\config.example.yaml") (Join-Path $OutputDir "config.yaml") -Force
New-Item -ItemType File -Path "$OutputDir\data\.gitkeep" -Force | Out-Null
New-Item -ItemType File -Path "$OutputDir\logs\.gitkeep" -Force | Out-Null

Write-Host ""
Write-Host "=== Build Complete ===" -ForegroundColor Green
Write-Host "Output: $OutputDir" -ForegroundColor White
Write-Host ""
Get-ChildItem $OutputDir -Recurse | Select-Object FullName
