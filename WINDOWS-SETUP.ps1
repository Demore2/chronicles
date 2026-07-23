# WINDOWS-SETUP.ps1
# Run this in PowerShell from your project root: G:\History App
# Usage: powershell -ExecutionPolicy Bypass -File WINDOWS-SETUP.ps1

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  R8: Windows Integration Setup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: package.json not found in current directory" -ForegroundColor Red
    Write-Host "Please run this script from your project root (G:\History App)" -ForegroundColor Yellow
    exit 1
}

# Step 1: Copy orchestration files
Write-Host "[1/5] Copying orchestration files..." -ForegroundColor Green

$filesToCopy = @(
    "AGENT-ORCHESTRATOR.md",
    "subagent-prompts.md",
    "orchestration-controller.mjs",
    "AUTONOMOUS-OPS.md",
    "INTEGRATION-GUIDE.md"
)

# Note: These files need to be downloaded from /mnt/user-data/outputs
# For now, we'll create a helper message
Write-Host "      ⚠️  Files need to be in current directory first." -ForegroundColor Yellow
Write-Host "      📥 Download these 5 files from the chat:" -ForegroundColor Yellow
foreach ($file in $filesToCopy) {
    Write-Host "         • $file" -ForegroundColor Gray
}
Write-Host ""

# Check if files exist
$missingFiles = @()
foreach ($file in $filesToCopy) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "⚠️  Missing files: $($missingFiles -join ', ')" -ForegroundColor Yellow
    Write-Host "   Continuing anyway — you can download them later." -ForegroundColor Gray
} else {
    Write-Host "      ✓ All orchestration files found" -ForegroundColor Green
}

Write-Host ""

# Step 2: Install dependency
Write-Host "[2/5] Installing @anthropic-ai/sdk..." -ForegroundColor Green
npm install @anthropic-ai/sdk
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "      ✓ Installed" -ForegroundColor Green
Write-Host ""

# Step 3: Update package.json
Write-Host "[3/5] Updating package.json with npm scripts..." -ForegroundColor Green

# Read package.json
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

# Add scripts if they don't exist
if (-not $packageJson.scripts) {
    $packageJson.scripts = @{}
}

$packageJson.scripts | Add-Member -MemberType NoteProperty -Name "generate:batch" -Value "node orchestration-controller.mjs" -Force
$packageJson.scripts | Add-Member -MemberType NoteProperty -Name "generate:batch:dev" -Value "node orchestration-controller.mjs" -Force
$packageJson.scripts | Add-Member -MemberType NoteProperty -Name "generate:batch:validate" -Value "npm run validate:content && npx tsc --noEmit && npm run lint" -Force

# Write back (preserving formatting as much as possible)
$packageJson | ConvertTo-Json -Depth 100 | Set-Content "package.json" -Encoding UTF8
Write-Host "      ✓ Added scripts: generate:batch, generate:batch:dev, generate:batch:validate" -ForegroundColor Green
Write-Host ""

# Step 4: Create .env.example
Write-Host "[4/5] Creating .env.example..." -ForegroundColor Green

$envExample = @"
# Orchestration Environment Variables

# Claude API
ANTHROPIC_API_KEY=sk-...

# Orchestration options
BATCH_TIMEOUT_MS=180000       # 3 minutes per subagent (ms)
BATCH_MAX_RETRIES=2            # Retry on failure
GIT_COMMIT=false               # Set to true for auto-commit in CI
"@

if (Test-Path ".env.example") {
    Write-Host "      ✓ .env.example already exists (not overwriting)" -ForegroundColor Yellow
} else {
    $envExample | Set-Content ".env.example" -Encoding UTF8
    Write-Host "      ✓ Created .env.example" -ForegroundColor Green
}

Write-Host ""

# Step 5: Create local .env (if it doesn't exist)
Write-Host "[5/5] Setting up local .env..." -ForegroundColor Green

if (Test-Path ".env") {
    Write-Host "      ✓ .env already exists (not overwriting)" -ForegroundColor Yellow
} else {
    $envExample | Set-Content ".env" -Encoding UTF8
    Write-Host "      ✓ Created .env (configure ANTHROPIC_API_KEY before running)" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Integration complete!" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Next steps:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Configure .env:" -ForegroundColor Yellow
Write-Host "   Edit .env and add your ANTHROPIC_API_KEY (sk-...)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test the setup:" -ForegroundColor Yellow
Write-Host "   npm run generate:batch -- --eras oudheid --count 1" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Check the output:" -ForegroundColor Yellow
Write-Host "   Should see new story in src/content/verhalen/oudheid.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Review generated story (optional):" -ForegroundColor Yellow
Write-Host "   npm run web   # and navigate to Home → Oudheid" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Green
Write-Host "   • INTEGRATION-GUIDE.md       — Full step-by-step guide" -ForegroundColor Gray
Write-Host "   • AGENT-ORCHESTRATOR.md      — Architecture & design" -ForegroundColor Gray
Write-Host "   • AUTONOMOUS-OPS.md          — Scheduling & monitoring" -ForegroundColor Gray
Write-Host "   • subagent-prompts.md        — Era-specific prompts" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
