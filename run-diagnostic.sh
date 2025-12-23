#!/bin/bash

# Tender Management System - Diagnostic Runner
# This script helps you diagnose and fix Supabase connection issues

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     🔍 TENDER MANAGEMENT - DATABASE DIAGNOSTIC            ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Please install Node.js from: https://nodejs.org"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    echo "   Please install npm"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Check if diagnostic script exists
if [ ! -f "diagnose-supabase.js" ]; then
    echo "❌ Diagnostic script not found!"
    echo "   Make sure you're in the project root directory"
    exit 1
fi

# Check if dotenv is installed
if ! npm list dotenv &> /dev/null; then
    echo "📦 Installing dotenv package..."
    npm install dotenv --silent
fi

echo "🔍 Running diagnostic..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run the diagnostic
node diagnose-supabase.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Need help?"
echo "   • Complete guide: open FIX_TENDER_ERROR.md"
echo "   • Quick reference: open QUICK_FIX_CARD.txt"
echo "   • Run again: npm run diagnose"
echo ""
