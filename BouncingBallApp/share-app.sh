#!/bin/bash

echo "🎯 Bouncing Ball App - Sharing Setup"
echo "====================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the BouncingBallApp folder!"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting the app for sharing..."
echo ""
echo "📱 SHARING OPTIONS:"
echo "=================="
echo ""
echo "1. QR CODE:"
echo "   - The QR code will appear in the terminal"
echo "   - Anyone can scan it with their phone"
echo ""
echo "2. EXPO LINK:"
echo "   - A link like 'https://expo.dev/@username/calming-ball' will appear"
echo "   - Share this link via email, text, or social media"
echo "   - Anyone can tap the link and open in Expo Go"
echo ""
echo "3. REQUIREMENTS FOR TESTERS:"
echo "   - Install 'Expo Go' app on their phone"
echo "   - iOS: App Store → Search 'Expo Go'"
echo "   - Android: Google Play → Search 'Expo Go'"
echo ""
echo "4. TESTING INSTRUCTIONS:"
echo "   - Tap 'Start' to begin the calming animation"
echo "   - Watch the ball bounce slowly and smoothly"
echo "   - Listen for gentle bounce sounds"
echo "   - Tap 'Pause' to stop the animation"
echo "   - Toggle sound on/off as needed"
echo ""
echo "💡 TIP: Keep this terminal open while sharing!"
echo ""

# Start the app
npx expo start 