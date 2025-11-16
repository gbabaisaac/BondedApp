#!/bin/bash

# Capacitor Setup Script for Bonded
# Run this to set up Capacitor for native app builds

echo "🚀 Setting up Capacitor for Bonded..."

# Install Capacitor packages
echo "📦 Installing Capacitor packages..."
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Initialize Capacitor
echo "⚙️  Initializing Capacitor..."
npx cap init "Bonded" "com.bonded.app" --web-dir=dist

# Build the app
echo "🔨 Building app..."
npm run build

# Add platforms
echo "📱 Adding iOS platform..."
npx cap add ios

echo "📱 Adding Android platform..."
npx cap add android

# Sync
echo "🔄 Syncing to native projects..."
npx cap sync

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  iOS:   npx cap open ios"
echo "  Android: npx cap open android"
echo ""
echo "After making changes:"
echo "  1. npm run build"
echo "  2. npx cap sync"
echo "  3. Build in Xcode/Android Studio"



