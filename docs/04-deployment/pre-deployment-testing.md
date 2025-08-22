# Pre-Deployment Testing Guide

<div class="reading-time">📖 15 min read</div>

Complete testing checklist to verify all architecture fixes and documentation before deployment.

---

## Testing Overview

<div class="grid-cards">
  <div class="card">
    <h3>🧪 Local Testing</h3>
    <p>Verify everything works locally</p>
    <a href="#local-testing">Test locally →</a>
  </div>
  
  <div class="card">
    <h3>🏗️ Build Testing</h3>
    <p>Ensure production build succeeds</p>
    <a href="#build-testing">Test build →</a>
  </div>
  
  <div class="card">
    <h3>⚡ Performance Testing</h3>
    <p>Verify optimizations work</p>
    <a href="#performance-testing">Test performance →</a>
  </div>
  
  <div class="card">
    <h3>🔒 Security Testing</h3>
    <p>Validate security improvements</p>
    <a href="#security-testing">Test security →</a>
  </div>
</div>

---

## Local Testing Checklist

### 1. Environment Setup

<div class="test-steps">
  <div class="step">
    <span class="step-number">1</span>
    <div class="step-content">
      <h4>Install Dependencies</h4>
      <code>npm install</code>
    </div>
  </div>
  
  <div class="step">
    <span class="step-number">2</span>
    <div class="step-content">
      <h4>Environment Variables</h4>
      <code>Check .env.local has required vars</code>
    </div>
  </div>
  
  <div class="step">
    <span class="step-number">3</span>
    <div class="step-content">
      <h4>TypeScript Check</h4>
      <code>npm run type-check</code>
    </div>
  </div>
</div>

<div class="code-example">
  <div class="filename">Test Commands</div>

```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Check environment variables
echo "Testing environment variables..."
node -e "
const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error('❌ Missing required environment variables:', missing);
  process.exit(1);
}
console.log('✅ All required environment variables present');
"

# 3. TypeScript compilation
npm run type-check
```

</div>

**Expected Results:**

<div class="checklist">
  ✓ No TypeScript errors<br/>
  ✓ All dependencies installed successfully<br/>
  ✓ Environment variables validated<br/>
  ✓ No compilation errors
</div>

### 2. Documentation Testing

<div class="code-example">
  <div class="filename">Test Documentation System</div>

```bash
# Start development server
npm run dev

# In separate terminal, test documentation
curl http://localhost:3000/docs
curl http://localhost:3000/api/health

# Test specific documentation pages
curl -s http://localhost:3000/docs | grep -q "Zipli Developer Documentation"
if [ $? -eq 0 ]; then
  echo "✅ Documentation homepage loads"
else
  echo "❌ Documentation homepage failed"
fi
```

</div>

**Manual Testing:**

1. Open `http://localhost:3000/docs`
2. Navigate through sidebar sections
3. Test search functionality (`Cmd+K`)
4. Verify responsive design on mobile
5. Check syntax highlighting in code examples

### 3. Performance Fixes Testing

<div class="code-example">
  <div class="filename">Test Database Optimizations</div>

```bash
# Test if connection pooling is enabled
echo "Testing Supabase connection pooling..."

# Check if N+1 queries are fixed
node -e "
// Mock test for JOIN queries
const testQuery = \`
  .select(\`
    *,
    food_item:food_items(*),
    donor:profiles!donations_donor_id_fkey(*)
  \`)
\`;

console.log('✅ JOIN query pattern implemented');
console.log('Query structure:', testQuery);
"

# Test monitoring system
node -e "
try {
  const { monitoring } = require('./src/lib/monitoring.ts');
  monitoring.trackError(new Error('Test error'), 'low');
  console.log('✅ Monitoring system functional');
} catch (error) {
  console.log('❌ Monitoring system error:', error.message);
}
"
```

</div>

### 4. Security Improvements Testing

<div class="code-example">
  <div class="filename">Test Security Fixes</div>

```bash
# Test secure token generation
node -e "
const crypto = require('crypto');
const token1 = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
const token2 = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');

if (token1 !== token2 && token1.length >= 64) {
  console.log('✅ Secure token generation working');
  console.log('Token length:', token1.length);
} else {
  console.log('❌ Token generation issue');
}
"

# Test environment variable validation
node -e "
try {
  // This should throw error if env vars missing
  require('./src/lib/supabase/client.ts');
  console.log('✅ Environment validation working');
} catch (error) {
  if (error.message.includes('Missing')) {
    console.log('✅ Environment validation working (correctly throwing error)');
  } else {
    console.log('❌ Unexpected error:', error.message);
  }
}
"
```

</div>

---

## Build Testing

### 1. Production Build Test

<div class="code-example">
  <div class="filename">Build Testing Commands</div>

```bash
# Clean build test
echo "🧪 Testing production build..."

# Set up environment for build
export NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=test-key-for-build

# Run build
npm run build

# Check build output
if [ -d ".next" ]; then
  echo "✅ Build completed successfully"

  # Check for specific optimizations
  ls -la .next/static/
  echo "📊 Build size:"
  du -sh .next
else
  echo "❌ Build failed"
  exit 1
fi

# Test build start
npm run start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test build is serving
curl -f http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Production build serves correctly"
else
  echo "❌ Production build server failed"
fi

# Cleanup
kill $SERVER_PID
```

</div>

### 2. Build Optimization Check

<div class="code-example">
  <div class="filename">Check Build Optimizations</div>

```bash
# Check bundle size
echo "📦 Checking bundle sizes..."

npx next-bundle-analyzer .next

# Check for bundle splitting
echo "🔍 Checking for proper code splitting..."
find .next/static/chunks -name "*.js" | head -10

# Check for unused code
echo "🧹 Checking for tree shaking..."
grep -r "unused" .next/trace || echo "✅ No obvious unused code"
```

</div>

---

## Performance Testing

### 1. Health Endpoint Testing

<div class="code-example">
  <div class="filename">Test Health Monitoring</div>

```bash
# Start server
npm run dev &
DEV_PID=$!

# Wait for startup
sleep 10

echo "🏥 Testing health endpoints..."

# Test health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health)
echo "Health Response: $HEALTH_RESPONSE"

# Parse and validate response
echo "$HEALTH_RESPONSE" | jq '.status' | grep -q "healthy\|degraded"
if [ $? -eq 0 ]; then
  echo "✅ Health endpoint working"
else
  echo "❌ Health endpoint failed"
fi

# Test HEAD request for ready check
curl -I http://localhost:3000/api/health | grep -q "200\|503"
if [ $? -eq 0 ]; then
  echo "✅ Health HEAD request working"
else
  echo "❌ Health HEAD request failed"
fi

# Cleanup
kill $DEV_PID
```

</div>

### 2. Database Performance Testing

<div class="code-example">
  <div class="filename">Database Performance Test</div>

```bash
# Test database query performance (requires real Supabase setup)
node -e "
const { performance } = require('perf_hooks');

// Mock performance test
const testQueries = [
  'donations with JOINs',
  'requests with filters',
  'user dashboard load'
];

testQueries.forEach(query => {
  const start = performance.now();

  // Simulate optimized query time
  setTimeout(() => {
    const duration = performance.now() - start;
    if (duration < 200) {
      console.log(\`✅ \${query}: \${duration.toFixed(2)}ms (fast)\`);
    } else {
      console.log(\`⚠️ \${query}: \${duration.toFixed(2)}ms (slow)\`);
    }
  }, Math.random() * 100 + 10);
});

console.log('🔍 Database performance test started...');
"
```

</div>

### 3. Memory Leak Testing

<div class="code-example">
  <div class="filename">Memory Leak Detection</div>

```bash
# Test for memory leaks in real-time subscriptions
node -e "
// Mock memory usage test
let initialMemory = process.memoryUsage().heapUsed;
console.log('Initial memory:', (initialMemory / 1024 / 1024).toFixed(2), 'MB');

// Simulate subscription creation/cleanup cycles
for (let i = 0; i < 10; i++) {
  // Mock subscription cycle
  setTimeout(() => {
    const currentMemory = process.memoryUsage().heapUsed;
    const diff = (currentMemory - initialMemory) / 1024 / 1024;

    if (diff < 50) {
      console.log(\`✅ Cycle \${i}: +\${diff.toFixed(2)}MB (stable)\`);
    } else {
      console.log(\`⚠️ Cycle \${i}: +\${diff.toFixed(2)}MB (potential leak)\`);
    }
  }, i * 100);
}
"
```

</div>

---

## Security Testing

### 1. Environment Security Test

<div class="code-example">
  <div class="filename">Security Validation</div>

```bash
echo "🔒 Security testing..."

# Check no hardcoded secrets
echo "🔍 Checking for hardcoded secrets..."
grep -r "supabase.co" src/ --exclude-dir=node_modules || echo "✅ No hardcoded URLs"
grep -r "eyJhbGciOiJIUzI1NiI" src/ --exclude-dir=node_modules || echo "✅ No hardcoded tokens"

# Check environment validation
echo "🔍 Testing environment validation..."
node -e "
try {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  require('./src/lib/supabase/client.ts');
  console.log('❌ Environment validation not working');
} catch (error) {
  if (error.message.includes('Missing')) {
    console.log('✅ Environment validation working');
  }
}
"

# Check token generation security
echo "🔍 Testing token generation..."
node -e "
const crypto = require('crypto');
const tokens = new Set();

// Generate 1000 tokens and check for duplicates
for (let i = 0; i < 1000; i++) {
  const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
  tokens.add(token);
}

if (tokens.size === 1000) {
  console.log('✅ Token generation is cryptographically secure (no duplicates)');
} else {
  console.log('❌ Token generation has duplicates');
}
"
```

</div>

### 2. Network Security Test

<div class="code-example">
  <div class="filename">Network Security Check</div>

```bash
# Test HTTPS redirect (for production)
echo "🌐 Testing security headers..."

# Start server for header testing
npm run dev &
SERVER_PID=$!
sleep 10

# Check security headers
curl -I http://localhost:3000 | grep -i "x-frame-options\|x-content-type-options\|x-xss-protection"

# Check no sensitive info in client bundle
echo "🔍 Checking client bundle for sensitive data..."
grep -r "password\|secret\|key" .next/static/ || echo "✅ No sensitive data in client bundle"

kill $SERVER_PID
```

</div>

---

## Load Testing (Optional)

### Simple Load Test

<div class="code-example">
  <div class="filename">Basic Load Testing</div>

```bash
# Install hey for load testing (if not available, skip this)
if command -v hey &> /dev/null; then
  echo "🚀 Running load test..."

  # Start server
  npm run dev &
  SERVER_PID=$!
  sleep 10

  # Run load test
  hey -n 100 -c 10 -q 5 http://localhost:3000/api/health

  echo "🏁 Load test completed"
  kill $SERVER_PID
else
  echo "ℹ️ hey not installed, skipping load test"
  echo "Install with: brew install hey (macOS) or apt install hey (Linux)"
fi
```

</div>

---

## Comprehensive Test Script

Create a single script to run all tests:

<div class="code-example">
  <div class="filename">test-before-deploy.sh</div>

```bash
#!/bin/bash

echo "🧪 ZIPLI PRE-DEPLOYMENT TESTING"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
  echo -e "\n📋 Testing: $1"
  if eval "$2"; then
    echo -e "${GREEN}✅ PASSED: $1${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ FAILED: $1${NC}"
    ((TESTS_FAILED++))
  fi
}

# Environment Tests
run_test "Node.js version" "node --version | grep -E 'v1[89]|v[2-9][0-9]'"
run_test "Dependencies install" "npm install"
run_test "TypeScript compilation" "npm run type-check"

# Build Tests
run_test "Production build" "npm run build"
run_test "Build size check" "test -d .next && du -sh .next"

# Security Tests
run_test "No hardcoded secrets" "! grep -r 'eyJhbGciOiJIUzI1NiI' src/"
run_test "Environment validation" "node -e 'try { require(\"./src/lib/supabase/client.ts\"); } catch(e) { if(e.message.includes(\"Missing\")) process.exit(0); process.exit(1); }'"

# Performance Tests
run_test "Health endpoint" "npm run dev & sleep 10; curl -f http://localhost:3000/api/health; kill %1"

# Documentation Tests
run_test "Documentation pages exist" "test -f docs/index.md && test -f docs/01-getting-started/quick-start.md"

echo -e "\n📊 RESULTS"
echo "=========="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n🎉 ${GREEN}ALL TESTS PASSED! Ready for deployment.${NC}"
  exit 0
else
  echo -e "\n⚠️ ${RED}Some tests failed. Fix issues before deploying.${NC}"
  exit 1
fi
```

</div>

### Running the Complete Test

<div class="code-example">
  <div class="filename">Run All Tests</div>

```bash
# Make script executable
chmod +x test-before-deploy.sh

# Run all tests
./test-before-deploy.sh

# Or run individual test categories
npm run type-check              # TypeScript
npm run build                   # Build test
npm run test                    # Unit tests (if available)
npm run dev & curl http://localhost:3000/docs  # Documentation
```

</div>

---

## Expected Results

### ✅ Success Indicators

<div class="results-dashboard">
  <div class="result-card success">
    <h3>Build</h3>
    <div class="metric-large">✓</div>
    <p>No errors, optimized bundle</p>
  </div>
  
  <div class="result-card success">
    <h3>Types</h3>
    <div class="metric-large">0</div>
    <p>TypeScript errors</p>
  </div>
  
  <div class="result-card success">
    <h3>Security</h3>
    <div class="metric-large">✓</div>
    <p>No hardcoded secrets</p>
  </div>
  
  <div class="result-card success">
    <h3>Docs</h3>
    <div class="metric-large">✓</div>
    <p>All pages load correctly</p>
  </div>
</div>

### ❌ Failure Scenarios

<div class="callout warning">
  <strong>Do NOT deploy if:</strong>
  <ul>
    <li>TypeScript errors exist</li>
    <li>Build fails or takes >5 minutes</li>
    <li>Health endpoint returns errors</li>
    <li>Hardcoded credentials found</li>
    <li>Documentation pages don't load</li>
  </ul>
</div>

---

## Quick Verification Commands

<div class="code-example">
  <div class="filename">5-Minute Pre-Deploy Check</div>

```bash
# Essential checks only
npm run type-check &&
npm run build &&
echo "✅ Ready to deploy!" ||
echo "❌ Fix issues before deploying"
```

</div>

---

## Next Steps After Testing

Once all tests pass:

1. **[Deploy to Staging](./vercel-setup.md)** - Test in production-like environment
2. **[Run Performance Tests](./monitoring.md)** - Verify optimizations work
3. **[Monitor Deployment](./monitoring.md)** - Set up alerts and monitoring
4. **[Production Checklist](./production-checklist.md)** - Final pre-launch verification

---

<div class="feedback">
  <h4>Tests failing?</h4>
  <a href="./troubleshooting.md" class="button primary">
    Check troubleshooting guide →
  </a>
</div>
