#!/bin/bash

# Footer Implementation Verification Script
# This script helps verify the footer is properly implemented across all pages

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          VECTOR Footer Implementation Verification            ║"
echo "║                   Neural Arc Inc.                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Checking implementation files...${NC}"
echo ""

# Check if footer component exists
if [ -f "components/ui/footer.tsx" ]; then
    echo -e "${GREEN}✓${NC} Footer component exists"
else
    echo -e "${YELLOW}✗${NC} Footer component NOT found"
fi

# Check if root layout has footer
if grep -q "Footer" app/layout.tsx; then
    echo -e "${GREEN}✓${NC} Footer integrated in root layout"
else
    echo -e "${YELLOW}✗${NC} Footer NOT in root layout"
fi

echo ""
echo -e "${BLUE}Checking page adjustments...${NC}"
echo ""

# Check each page for proper height adjustment
pages=(
    "app/page.tsx"
    "app/auth/pin/page.tsx"
    "components/dashboard/DashboardView.tsx"
    "app/proposals/page.tsx"
    "app/test-api/page.tsx"
)

for page in "${pages[@]}"; do
    if [ -f "$page" ]; then
        if grep -q "min-h-\[calc(100vh-60px)\]" "$page"; then
            echo -e "${GREEN}✓${NC} $page - Footer spacing applied"
        else
            echo -e "${YELLOW}?${NC} $page - Check spacing"
        fi
    else
        echo -e "${YELLOW}✗${NC} $page - File not found"
    fi
done

echo ""
echo -e "${BLUE}Checking TypeScript compilation...${NC}"
echo ""

# Run TypeScript check (optional)
if command -v npm &> /dev/null; then
    echo "Running TypeScript check..."
    npx tsc --noEmit --skipLibCheck 2>&1 | grep -i footer || echo -e "${GREEN}✓${NC} No TypeScript errors in footer"
else
    echo -e "${YELLOW}!${NC} npm not available, skipping TypeScript check"
fi

echo ""
echo -e "${BLUE}Documentation files...${NC}"
echo ""

if [ -f "FOOTER_IMPLEMENTATION.md" ]; then
    echo -e "${GREEN}✓${NC} Implementation guide exists"
else
    echo -e "${YELLOW}✗${NC} Implementation guide NOT found"
fi

if [ -f "FOOTER_COMPLETE_SUMMARY.md" ]; then
    echo -e "${GREEN}✓${NC} Summary document exists"
else
    echo -e "${YELLOW}✗${NC} Summary document NOT found"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Manual Testing Checklist                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Start the dev server and verify footer appears on:"
echo ""
echo "  1. Login page           → http://localhost:3000/auth/pin"
echo "  2. Loading page         → http://localhost:3000/"
echo "  3. Admin dashboard      → http://localhost:3000/admin"
echo "  4. Client dashboard     → http://localhost:3000/client"
echo "  5. AI Proposals         → http://localhost:3000/proposals"
echo "  6. API Test page        → http://localhost:3000/test-api"
echo ""
echo "Verify footer content:"
echo "  - Displays: VECTOR • © 2024 All rights reserved by Neural Arc Inc."
echo "  - Link to neuralarc.ai works (opens in new tab)"
echo "  - Responsive on mobile and desktop"
echo "  - Consistent styling across all pages"
echo ""
echo -e "${GREEN}Run: npm run dev${NC} to start the development server"
echo ""



