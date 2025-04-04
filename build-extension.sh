#!/bin/bash

# Build script for CyberGuard Chrome Extension

echo "Building CyberGuard Chrome Extension..."

# Create build directory if it doesn't exist
mkdir -p build/extension

# Copy client/public files to build directory
cp -r client/public/* build/extension/

echo "Extension files copied to build/extension/"
echo "To load the extension in Chrome:"
echo "1. Go to chrome://extensions/"
echo "2. Enable Developer mode"
echo "3. Click 'Load unpacked'"
echo "4. Select the build/extension directory"

echo "Done!"