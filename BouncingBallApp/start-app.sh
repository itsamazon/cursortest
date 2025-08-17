#!/bin/bash

echo "🎯 Starting Bouncing Ball App..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the BouncingBallApp folder!"
    echo "Current directory: $(pwd)"
    echo "Expected: .../BouncingBallApp/"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting the app..."
echo ""
echo "📱 To test on your phone:"
echo "1. Install 'Expo Go' app on your phone"
echo "2. Scan the QR code that appears below"
echo "3. The app will load on your phone!"
echo ""
echo "💻 To test on computer:"
echo "- Press 'w' for web browser"
echo "- Press 'i' for iOS simulator (Mac only)"
echo "- Press 'a' for Android emulator"
echo ""

# Start the app
npx expo start 