# PowerShell script to set up Supabase backend
# Run this script: .\setup-backend.ps1

Write-Host "🚀 Setting up Supabase Backend..." -ForegroundColor Cyan
Write-Host ""

# Check if npx is available
Write-Host "📦 Checking for Supabase CLI..." -ForegroundColor Yellow
$supabaseCheck = npx supabase --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   Option 1: Install Scoop, then: scoop install supabase" -ForegroundColor Yellow
    Write-Host "   Option 2: Use npx supabase (recommended for now)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Continuing with npx..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 1: Login to Supabase" -ForegroundColor Cyan
Write-Host "This will open your browser for authentication..." -ForegroundColor Gray
$login = Read-Host "Press Enter to continue (or type 'skip' to skip)"
if ($login -ne "skip") {
    npx supabase login
}

Write-Host ""
Write-Host "Step 2: Link to your project" -ForegroundColor Cyan
$projectRef = Read-Host "Enter your Supabase project reference (from your project URL)"
if ($projectRef) {
    npx supabase link --project-ref $projectRef
}

Write-Host ""
Write-Host "Step 3: Run database migrations" -ForegroundColor Cyan
$runMigrations = Read-Host "Run migrations? (y/n)"
if ($runMigrations -eq "y") {
    npx supabase db push
}

Write-Host ""
Write-Host "Step 4: Deploy Edge Function" -ForegroundColor Cyan
$deployFunction = Read-Host "Deploy function? (y/n)"
if ($deployFunction -eq "y") {
    npx supabase functions deploy make-server-2516be19
}

Write-Host ""
Write-Host "Step 5: Set function secrets" -ForegroundColor Cyan
Write-Host "You'll need your SUPABASE_URL and SERVICE_ROLE_KEY from Supabase Dashboard" -ForegroundColor Gray
$setSecrets = Read-Host "Set secrets? (y/n)"
if ($setSecrets -eq "y") {
    $supabaseUrl = Read-Host "Enter SUPABASE_URL (e.g., https://xxxxx.supabase.co)"
    $serviceRoleKey = Read-Host "Enter SERVICE_ROLE_KEY (from Settings → API)"
    $environment = Read-Host "Enter ENVIRONMENT (development/production) [default: development]"
    if (!$environment) { $environment = "development" }
    
    if ($supabaseUrl -and $serviceRoleKey) {
        npx supabase secrets set SUPABASE_URL=$supabaseUrl
        npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey
        npx supabase secrets set ENVIRONMENT=$environment
        Write-Host "✅ Secrets set successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing required values. Skipping secrets setup." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY" -ForegroundColor Yellow
Write-Host "2. Test your connection by running: npm run dev" -ForegroundColor Yellow
Write-Host "3. Check function logs: npx supabase functions logs make-server-2516be19" -ForegroundColor Yellow

