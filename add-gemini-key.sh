#!/bin/bash

# Script to add GEMINI_API_KEY to .env.local
# Run this script after getting your API key from https://aistudio.google.com/app/apikey

echo "🔑 Gemini API Key Setup"
echo "======================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Creating .env.local from env.example..."
    cp env.example .env.local
    echo "✅ Created .env.local"
fi

# Prompt for API key
echo "Please enter your Gemini API key:"
echo "(Get it from: https://aistudio.google.com/app/apikey)"
echo ""
read -p "API Key: " api_key

if [ -z "$api_key" ]; then
    echo "❌ Error: No API key provided"
    exit 1
fi

# Check if GEMINI_API_KEY already exists
if grep -q "^GEMINI_API_KEY=" .env.local; then
    echo ""
    echo "⚠️  GEMINI_API_KEY already exists in .env.local"
    read -p "Do you want to replace it? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Replace existing key (macOS compatible)
        sed -i '' "s|^GEMINI_API_KEY=.*|GEMINI_API_KEY=$api_key|" .env.local
        echo "✅ Updated GEMINI_API_KEY in .env.local"
    else
        echo "❌ Cancelled. Keeping existing key."
        exit 0
    fi
else
    # Add new key
    echo "" >> .env.local
    echo "# Gemini AI Configuration (REQUIRED for document parsing)" >> .env.local
    echo "GEMINI_API_KEY=$api_key" >> .env.local
    echo "# Get your API key from: https://aistudio.google.com/app/apikey" >> .env.local
    echo "✅ Added GEMINI_API_KEY to .env.local"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Start/restart your dev server: npm run dev"
echo "2. Open Partner Portal: http://localhost:3000/client"
echo "3. Login (PIN: 1111)"
echo "4. Click 'Post Tender' and upload a document"
echo "5. Watch AI extract all information automatically! ✨"
echo ""

