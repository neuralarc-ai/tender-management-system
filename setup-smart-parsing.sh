#!/bin/bash

# Smart Document Parsing Setup Script
# This script sets up Gemini AI document parsing for the Tender Management System

echo "🚀 Setting up Smart Document Parsing with Gemini AI..."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "📦 Installing required dependencies..."
npm install @google/generative-ai

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file from template..."
    cp env.example .env.local
    echo "✅ .env.local file created!"
else
    echo "ℹ️  .env.local already exists"
fi

echo ""
echo "🔑 IMPORTANT: Configure your Gemini API Key"
echo ""
echo "1. Visit: https://aistudio.google.com/app/apikey"
echo "2. Sign in with your Google account"
echo "3. Click 'Create API Key'"
echo "4. Copy the generated key"
echo "5. Open .env.local and add:"
echo ""
echo "   GEMINI_API_KEY=your_gemini_api_key_here"
echo ""

# Check if GEMINI_API_KEY is set
if grep -q "^GEMINI_API_KEY=your_gemini_api_key_here" .env.local 2>/dev/null || ! grep -q "^GEMINI_API_KEY=" .env.local 2>/dev/null; then
    echo "⚠️  WARNING: GEMINI_API_KEY not configured yet!"
    echo ""
    read -p "Do you want to enter your Gemini API key now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your Gemini API key: " api_key
        if [ ! -z "$api_key" ]; then
            # Check if key already exists in .env.local
            if grep -q "^GEMINI_API_KEY=" .env.local; then
                # Replace existing key
                sed -i.bak "s|^GEMINI_API_KEY=.*|GEMINI_API_KEY=$api_key|" .env.local
                rm .env.local.bak 2>/dev/null
            else
                # Add new key
                echo "GEMINI_API_KEY=$api_key" >> .env.local
            fi
            echo "✅ API key configured successfully!"
        fi
    fi
else
    echo "✅ GEMINI_API_KEY is already configured"
fi

echo ""
echo "📋 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Ensure GEMINI_API_KEY is set in .env.local"
echo "2. Run: npm run dev"
echo "3. Navigate to Partner Portal"
echo "4. Click 'Post Tender' and upload a document"
echo "5. Watch AI automatically extract tender information! ✨"
echo ""
echo "📚 Documentation: docs/SMART_DOCUMENT_PARSING_GUIDE.md"
echo ""

