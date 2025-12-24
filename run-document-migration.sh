#!/bin/bash

# Script to create tender_documents table in Supabase
# This table is required for the Document Generation Center feature

echo "🗄️  Creating tender_documents table in Supabase..."
echo ""

# Read Supabase credentials from .env.local
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "❌ Error: .env.local file not found!"
    exit 1
fi

# Check if NEXT_PUBLIC_SUPABASE_URL is set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    exit 1
fi

echo "📍 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""
echo "🔧 Please run this SQL in your Supabase dashboard:"
echo ""
echo "1. Go to: $NEXT_PUBLIC_SUPABASE_URL/project/_/sql"
echo "2. Click 'New Query'"
echo "3. Copy the contents of: supabase/migrations/009_ai_document_generation.sql"
echo "4. Paste and run the query"
echo ""
echo "OR"
echo ""
echo "📋 Copy this SQL and run it in Supabase SQL Editor:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat supabase/migrations/009_ai_document_generation.sql
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After running the SQL:"
echo "✅ Restart your dev server"
echo "✅ Test document generation in Intelligence screen"
echo ""

