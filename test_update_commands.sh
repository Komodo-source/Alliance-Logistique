#!/bin/bash

echo "=== Update System Test Commands ==="
echo ""

echo "1. Check if you're logged into EAS:"
echo "   eas whoami"
echo ""

echo "2. Build a production APK for testing:"
echo "   eas build --platform android --profile preview --distribution internal"
echo ""

echo "3. Publish a test update:"
echo "   eas update --channel main"
echo ""

echo "4. Check update status:"
echo "   eas update:view"
echo ""

echo "5. List all updates:"
echo "   eas update:list"
echo ""

echo "6. Check your project configuration:"
echo "   eas project:info"
echo ""

echo "=== Testing Steps ==="
echo "1. Run the build command above"
echo "2. Install the APK on a real device (not simulator)"
echo "3. Open the app and navigate to UpdateTest screen"
echo "4. Run the diagnostic to check if updates are enabled"
echo "5. Publish an update using the update command"
echo "6. Test the update process in the app"
echo ""

echo "=== Common Issues ==="
echo "- Updates don't work in development mode"
echo "- Updates don't work in simulators"
echo "- Make sure you're using a production build"
echo "- Check your internet connection"
echo "- Verify your EAS project ID is correct" 