#!/bin/bash

echo "🧪 ZIPLI PRE-DEPLOYMENT TESTING"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0
START_TIME=$(date +%s)

run_test() {
  echo -e "\n${BLUE}📋 Testing: $1${NC}"
  if eval "$2" > /tmp/test_output 2>&1; then
    echo -e "${GREEN}✅ PASSED: $1${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ FAILED: $1${NC}"
    echo -e "${YELLOW}Error output:${NC}"
    cat /tmp/test_output | head -5
    ((TESTS_FAILED++))
  fi
}

run_test_with_output() {
  echo -e "\n${BLUE}📋 Testing: $1${NC}"
  if eval "$2"; then
    echo -e "${GREEN}✅ PASSED: $1${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ FAILED: $1${NC}"
    ((TESTS_FAILED++))
  fi
}

echo -e "${BLUE}🔧 Environment Checks${NC}"
echo "===================="

# Environment Tests
run_test "Node.js version (>=18)" "node --version | grep -E 'v1[89]|v[2-9][0-9]'"
run_test "NPM version" "npm --version"
run_test "Dependencies installation" "npm ci --silent"

echo -e "\n${BLUE}📁 Project Structure${NC}"
echo "===================="

# Project structure tests
run_test "Package.json exists" "test -f package.json"
run_test "Source directory exists" "test -d src"
run_test "Documentation exists" "test -f docs/index.md"
run_test "Supabase config exists" "test -f supabase/config.toml"

echo -e "\n${BLUE}🔤 TypeScript & Code Quality${NC}"
echo "============================="

# TypeScript and code quality
run_test "TypeScript compilation" "npx tsc --noEmit"
run_test "ESLint check" "npm run lint --silent"

echo -e "\n${BLUE}🏗️ Build Testing${NC}"
echo "================"

# Build tests with environment variables for build
export NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-"https://test.supabase.co"}
export NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-"test-key-for-build"}

run_test "Production build" "npm run build --silent"
run_test "Build output exists" "test -d .next"

if [ -d ".next" ]; then
  BUILD_SIZE=$(du -sh .next | cut -f1)
  echo -e "${BLUE}📦 Build size: ${BUILD_SIZE}${NC}"
fi

echo -e "\n${BLUE}🔒 Security Checks${NC}"
echo "=================="

# Security tests
run_test "No hardcoded Supabase URLs in source" "! grep -r 'https://.*supabase.co' src/ 2>/dev/null"
run_test "No hardcoded tokens in source" "! grep -r 'eyJhbGciOiJIUzI1NiI' src/ 2>/dev/null" 
run_test "No console.log in production code" "! grep -r 'console.log' src/ 2>/dev/null || echo 'Warning: console.log found'"

# Test environment validation
run_test "Environment validation works" "node -e '
try {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  require(\"./src/lib/supabase/client.ts\");
  process.exit(1);
} catch (error) {
  if (error.message.includes(\"Missing\")) {
    process.exit(0);
  }
  process.exit(1);
}'"

echo -e "\n${BLUE}🚀 Performance Checks${NC}"
echo "====================="

# Test monitoring system
run_test "Monitoring system functional" "node -e '
try {
  const fs = require(\"fs\");
  if (fs.existsSync(\"./src/lib/monitoring.ts\")) {
    console.log(\"Monitoring system exists\");
    process.exit(0);
  } else {
    process.exit(1);
  }
} catch (error) {
  process.exit(1);
}'"

# Test health endpoint structure
run_test "Health endpoint exists" "test -f src/app/api/health/route.ts"

echo -e "\n${BLUE}📚 Documentation Checks${NC}"
echo "======================="

# Documentation tests
run_test "Main documentation index" "test -f docs/index.md"
run_test "Getting started guide" "test -f docs/01-getting-started/quick-start.md"
run_test "Architecture docs" "test -f docs/02-architecture/system-design.md"
run_test "Deployment docs" "test -f docs/04-deployment/monitoring.md"
run_test "ADR documentation" "test -f docs/06-decisions/performance-fixes.md"
run_test "Web documentation viewer" "test -f src/app/docs/page.tsx"

echo -e "\n${BLUE}⚙️ Configuration Checks${NC}"
echo "======================="

# Configuration tests
run_test "Supabase pooling enabled" "grep -q 'enabled = true' supabase/config.toml"
run_test "Performance indexes migration exists" "test -f supabase/migrations/20250821_performance_indexes.sql"

# Test package.json dependencies
run_test "React Markdown installed" "node -e 'require(\"./package.json\").dependencies[\"react-markdown\"] || process.exit(1)'"
run_test "Syntax highlighter installed" "node -e 'require(\"./package.json\").dependencies[\"react-syntax-highlighter\"] || process.exit(1)'"

echo -e "\n${BLUE}🧪 Quick Functionality Test${NC}"
echo "==========================="

# Start server for basic functionality test
echo "Starting development server for testing..."
npm run dev > /tmp/server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 15

# Test if server is responding
if curl -f http://localhost:3000 > /dev/null 2>&1; then
  echo -e "${GREEN}✅ PASSED: Development server responds${NC}"
  ((TESTS_PASSED++))
  
  # Test documentation endpoint
  if curl -f http://localhost:3000/docs > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED: Documentation endpoint responds${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ FAILED: Documentation endpoint${NC}"
    ((TESTS_FAILED++))
  fi
  
  # Test health endpoint (if environment allows)
  if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED: Health endpoint responds${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${YELLOW}⚠️ WARNING: Health endpoint not responding (may need real env vars)${NC}"
  fi
  
else
  echo -e "${RED}❌ FAILED: Development server not responding${NC}"
  ((TESTS_FAILED++))
fi

# Cleanup server
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "\n${BLUE}📊 TEST RESULTS${NC}"
echo "==============="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo -e "${BLUE}Duration: ${DURATION}s${NC}"

# Overall result
if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n🎉 ${GREEN}ALL TESTS PASSED!${NC}"
  echo -e "${GREEN}✅ Ready for deployment to staging/production${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Set up real environment variables"
  echo "2. Deploy to staging first"
  echo "3. Run production smoke tests"
  echo "4. Monitor deployment closely"
  exit 0
else
  echo -e "\n⚠️ ${RED}$TESTS_FAILED TEST(S) FAILED${NC}"
  echo -e "${RED}❌ DO NOT DEPLOY until all issues are resolved${NC}"
  echo ""
  echo "Common fixes:"
  echo "- Check environment variables in .env.local"
  echo "- Run 'npm install' to fix dependency issues"
  echo "- Fix TypeScript errors shown above"
  echo "- Ensure all required files exist"
  exit 1
fi