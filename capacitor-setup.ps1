# Capacitor Setup Script for Bonded (PowerShell)
# Run this to set up Capacitor for native app builds

Write-Host "🚀 Setting up Capacitor for Bonded..." -ForegroundColor Green

# Install Capacitor packages
Write-Host "`n📦 Installing Capacitor packages..." -ForegroundColor Yellow
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Initialize Capacitor
Write-Host "`n⚙️  Initializing Capacitor..." -ForegroundColor Yellow
npx cap init "Bonded" "com.bonded.app" --web-dir=dist

# Build the app
Write-Host "`n🔨 Building app..." -ForegroundColor Yellow
npm run build

# Add platforms
Write-Host "`n📱 Adding iOS platform..." -ForegroundColor Yellow
npx cap add ios

Write-Host "`n📱 Adding Android platform..." -ForegroundColor Yellow
npx cap add android

# Sync
Write-Host "`n🔄 Syncing to native projects..." -ForegroundColor Yellow
npx cap sync

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  iOS:   npx cap open ios" -ForegroundColor White
Write-Host "  Android: npx cap open android" -ForegroundColor White
Write-Host "`nAfter making changes:" -ForegroundColor Cyan
Write-Host "  1. npm run build" -ForegroundColor White
Write-Host "  2. npx cap sync" -ForegroundColor White
Write-Host "  3. Build in Xcode/Android Studio" -ForegroundColor White




