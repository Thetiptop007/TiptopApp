#!/bin/bash

# Menu Integration Setup Script
# This script helps you set up and test the menu integration

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TipTop Menu Integration Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this from TiptopApp directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Step 1: Installing dependencies...${NC}"
if npm list axios @react-native-async-storage/async-storage >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
else
    echo "Installing axios and @react-native-async-storage/async-storage..."
    npm install axios @react-native-async-storage/async-storage
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi
echo ""

echo -e "${YELLOW}📋 Step 2: Checking Backend connection...${NC}"
BACKEND_URL="http://192.168.1.26:5000"

# Check if backend is running
if curl -s -f "${BACKEND_URL}/api/v1/menu?limit=1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running at ${BACKEND_URL}${NC}"
    
    # Get menu count
    MENU_COUNT=$(curl -s "${BACKEND_URL}/api/v1/menu?limit=1" | grep -o '"total":[0-9]*' | grep -o '[0-9]*' | head -1)
    if [ ! -z "$MENU_COUNT" ]; then
        echo -e "${GREEN}   📊 Found ${MENU_COUNT} menu items in database${NC}"
    fi
    
    # Get categories
    CATEGORIES=$(curl -s "${BACKEND_URL}/api/v1/menu/categories/all" | grep -o '"results":[0-9]*' | grep -o '[0-9]*' | head -1)
    if [ ! -z "$CATEGORIES" ]; then
        echo -e "${GREEN}   🏷️  Found ${CATEGORIES} categories${NC}"
    fi
else
    echo -e "${RED}❌ Cannot connect to backend at ${BACKEND_URL}${NC}"
    echo -e "${YELLOW}   Please ensure:${NC}"
    echo "   1. Backend server is running (npm run dev)"
    echo "   2. Your device is on the same network"
    echo "   3. Update IP in src/api/client.ts if needed"
    exit 1
fi
echo ""

echo -e "${YELLOW}📋 Step 3: Verifying file structure...${NC}"

# Check if all required files exist
FILES=(
    "src/api/client.ts"
    "src/api/menu.api.ts"
    "src/types/menu.types.ts"
    "src/services/cache.service.ts"
    "src/hooks/useDebounce.ts"
    "src/hooks/useMenu.ts"
)

ALL_FILES_EXIST=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (missing)${NC}"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
    echo -e "${RED}❌ Some files are missing. Please check the implementation guide.${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}📋 Step 4: TypeScript check...${NC}"
if command -v tsc >/dev/null 2>&1; then
    echo "Running TypeScript compiler check..."
    if npx tsc --noEmit 2>&1 | grep -i "error" >/dev/null; then
        echo -e "${YELLOW}⚠️  TypeScript errors found. Review them before continuing.${NC}"
    else
        echo -e "${GREEN}✅ No TypeScript errors${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  TypeScript not found, skipping check${NC}"
fi
echo ""

echo -e "${YELLOW}📋 Step 5: Quick API test...${NC}"
echo "Testing key endpoints:"

# Test menu endpoint
if curl -s -f "${BACKEND_URL}/api/v1/menu?limit=1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ GET /api/v1/menu${NC}"
else
    echo -e "${RED}❌ GET /api/v1/menu${NC}"
fi

# Test categories endpoint
if curl -s -f "${BACKEND_URL}/api/v1/menu/categories/all" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ GET /api/v1/menu/categories/all${NC}"
else
    echo -e "${RED}❌ GET /api/v1/menu/categories/all${NC}"
fi

# Test search endpoint
if curl -s -f "${BACKEND_URL}/api/v1/menu?search=chicken&limit=1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ GET /api/v1/menu?search=...${NC}"
else
    echo -e "${RED}❌ GET /api/v1/menu?search=...${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}📱 Next Steps:${NC}"
echo "   1. Update MenuScreen.tsx to use the useMenu hook"
echo "   2. Run the app: npm start or npx expo start"
echo "   3. Navigate to Menu screen"
echo "   4. Check console logs for API calls"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo "   - Strategy: MENU_INTEGRATION_STRATEGY.md"
echo "   - Guide: IMPLEMENTATION_GUIDE.md"
echo ""
echo -e "${YELLOW}🧪 Testing:${NC}"
echo "   - Search functionality (debounced)"
echo "   - Category filtering"
echo "   - Infinite scroll (pagination)"
echo "   - Pull to refresh"
echo "   - Offline mode (cached data)"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
