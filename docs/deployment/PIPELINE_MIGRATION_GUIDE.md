# 🔄 Deployment Pipeline Migration Guide

## Quick Setup for New Projects

This guide provides a streamlined checklist for implementing the same professional deployment pipeline in other projects.

### Prerequisites

- Node.js 18+
- Git repository
- GitHub account
- Vercel account (or similar hosting platform)

---

## 📋 Migration Checklist

### Phase 1: Code Quality Foundation (1-2 hours)

#### TypeScript Setup

```bash
# 1. Configure strict TypeScript
```

**tsconfig.json**

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

- [ ] ✅ Fix all TypeScript errors (`npm run type-check`)
- [ ] ✅ Handle array vs string params: `Array.isArray(id) ? id[0] : id`
- [ ] ✅ Add type assertions for enums and API responses
- [ ] ✅ Handle JSON fields: `JSON.stringify(data)`
- [ ] ✅ Add required object properties

#### ESLint Configuration

```bash
npm install --save-dev @eslint/eslintrc @eslint/js
```

**eslint.config.js** (copy from main documentation)

- [ ] ✅ Create modern ESLint config (v9+ compatible)
- [ ] ✅ Configure ignore patterns for build folders
- [ ] ✅ Set rules for React/Next.js

#### Prettier Setup

- [ ] ✅ Copy `.prettierrc` and `.prettierignore`
- [ ] ✅ Format entire codebase: `npx prettier --write .`

### Phase 2: Git Strategy (30 minutes)

```bash
# 1. Create develop branch
git checkout -b develop
git push -u origin develop

# 2. Set up branch protection (GitHub UI)
# Settings → Branches → Add rule for "main"
# - Require pull request reviews ✓
# - Require status checks ✓
# - Require up-to-date branches ✓
```

- [ ] ✅ Create `develop` branch
- [ ] ✅ Push to remote
- [ ] ✅ Configure branch protection rules
- [ ] ✅ Set up PR template (optional)

### Phase 3: Pre-commit Hooks (15 minutes)

```bash
# 1. Install dependencies
npm install --save-dev husky lint-staged

# 2. Initialize husky
npx husky init

# 3. Create pre-commit hook
echo "npx lint-staged" > .husky/pre-commit
```

**package.json** (add to existing)

```json
{
  "scripts": {
    "prepare": "husky",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write .",
    "validate": "npm run type-check && npm run lint && npm run test"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["tsc --noEmit", "eslint --fix"],
    "*.{js,jsx,ts,tsx,json,css,md}": ["prettier --write"]
  }
}
```

- [ ] ✅ Install husky + lint-staged
- [ ] ✅ Initialize husky
- [ ] ✅ Configure lint-staged
- [ ] ✅ Test pre-commit hook: `git add . && git commit -m "test"`

### Phase 4: CI/CD Pipeline (20 minutes)

**Create `.github/workflows/ci.yml`**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint -- --max-warnings 0
      - run: npm run test
      - run: npm run build
```

**GitHub Secrets** (Repository Settings → Secrets)

- [ ] ✅ `VERCEL_TOKEN` (from Vercel account settings)
- [ ] ✅ `ORG_ID` (from Vercel project settings)
- [ ] ✅ `PROJECT_ID` (from Vercel project settings)
- [ ] ✅ `TEAM_ID` (if using Vercel teams)

### Phase 5: Vercel Integration (10 minutes)

1. **Import Repository**
   - Go to Vercel Dashboard → New Project
   - Import from GitHub
   - Configure build settings automatically

2. **Environment Variables**
   - Copy all environment variables from existing project
   - Set for Production, Preview, and Development

3. **Git Configuration**
   - Production Branch: `main`
   - Preview Deployments: Enabled for all branches

- [ ] ✅ Connect GitHub repository
- [ ] ✅ Configure environment variables
- [ ] ✅ Enable preview deployments
- [ ] ✅ Test deployment from `main` branch

### Phase 6: VS Code Settings (5 minutes)

**Create `.vscode/settings.json`** (copy from main documentation)

- [ ] ✅ Copy VS Code settings
- [ ] ✅ Install recommended extensions:
  - ESLint
  - Prettier
  - TypeScript Importer
  - Tailwind CSS IntelliSense (if applicable)

### Phase 7: Documentation (10 minutes)

- [ ] ✅ Copy `DEPLOYMENT_PIPELINE.md`
- [ ] ✅ Update `DEVELOPMENT.md` or create if missing
- [ ] ✅ Update project README with pipeline info
- [ ] ✅ Document environment setup

---

## 🧪 Validation Tests

Run these tests to ensure everything is working:

### Local Validation

```bash
# 1. TypeScript check
npm run type-check
# Should: Pass with 0 errors

# 2. Linting
npm run lint
# Should: Pass or show only warnings

# 3. Full validation
npm run validate
# Should: Pass all checks

# 4. Pre-commit test
git add .
git commit -m "test: validate pre-commit hooks"
# Should: Run validation before commit
```

### GitHub Actions Validation

```bash
# 1. Push to develop branch
git checkout develop
git push origin develop
# Should: Trigger CI workflow

# 2. Create test PR
git checkout -b test/pipeline-validation
echo "# Pipeline Test" > test-file.md
git add test-file.md
git commit -m "test: pipeline validation"
git push -u origin test/pipeline-validation
# Create PR on GitHub - should trigger CI
```

### Deployment Validation

- [ ] ✅ Main branch deploys to production URL
- [ ] ✅ Develop branch creates preview URL
- [ ] ✅ Feature branches create temporary preview URLs
- [ ] ✅ PR comments show deployment URLs

---

## 🛠 Framework-Specific Adaptations

### Next.js Projects

- Use the configuration as-is
- Ensure `next.config.js` is compatible
- Verify environment variables work in both client/server

### React/Vite Projects

**Update CI commands:**

```yaml
- run: npm run type-check || npx tsc --noEmit
- run: npm run build
```

**Vite-specific tsconfig:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

### Node.js/Express APIs

**Update CI workflow:**

```yaml
- run: npm run type-check
- run: npm run lint
- run: npm run test
- run: npm run build || echo "No build step needed"
```

### Turborepo/Monorepos

**Update package.json scripts:**

```json
{
  "scripts": {
    "type-check": "turbo run type-check",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "build": "turbo run build"
  }
}
```

---

## 🎯 Project-Specific Customizations

### Database Migrations (if applicable)

```yaml
# Add to CI workflow
- name: Run Migrations
  run: npm run db:migrate
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

### Environment Variables Template

```bash
# .env.example
NEXT_PUBLIC_API_URL=
DATABASE_URL=
API_SECRET_KEY=
THIRD_PARTY_API_KEY=
```

### Custom Build Steps

```yaml
# Example: Add bundle size check
- name: Bundle Analysis
  run: npm run build:analyze

# Example: E2E tests
- name: E2E Tests
  run: npm run test:e2e
```

---

## ⏱ Time Estimates

| Phase              | Estimated Time  | Complexity |
| ------------------ | --------------- | ---------- |
| Code Quality Setup | 1-2 hours       | Medium     |
| Git Strategy       | 30 minutes      | Easy       |
| Pre-commit Hooks   | 15 minutes      | Easy       |
| CI/CD Pipeline     | 20 minutes      | Medium     |
| Vercel Integration | 10 minutes      | Easy       |
| VS Code Settings   | 5 minutes       | Easy       |
| Documentation      | 10 minutes      | Easy       |
| **Total**          | **2.5-3 hours** |            |

### Factors that may increase time:

- Large codebase with many TypeScript errors
- Complex build process
- Custom testing requirements
- Multiple deployment environments
- Team onboarding and training

---

## 📚 Useful Commands During Migration

### Debugging Commands

```bash
# Check TypeScript errors with details
npx tsc --noEmit --listFiles

# Test ESLint configuration
npx eslint --print-config src/index.ts

# Debug pre-commit hooks
npx lint-staged --debug

# Check installed hook
cat .husky/pre-commit

# Test GitHub Actions locally (requires 'act')
act -j test
```

### Cleanup Commands

```bash
# Reset pre-commit hooks
rm -rf .husky
npm run prepare

# Clear cache and rebuild
npm run clean  # or equivalent
rm -rf node_modules/.cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 🆘 Common Issues & Solutions

### TypeScript Errors

```bash
# Problem: Strict mode errors
# Solution: Fix incrementally
npx tsc --noEmit | head -20  # See first 20 errors

# Problem: Import errors
# Solution: Check paths in tsconfig.json
```

### Pre-commit Hook Issues

```bash
# Problem: Hook not running
# Solution: Check permissions
chmod +x .husky/pre-commit

# Problem: Hook failing
# Solution: Test commands individually
npm run type-check
npm run lint
npx lint-staged
```

### CI/CD Issues

```bash
# Problem: GitHub Actions failing
# Solution: Check secrets and environment
# - Verify all secrets are set
# - Check Node version compatibility
# - Ensure lock file is committed
```

### Deployment Issues

```bash
# Problem: Vercel build failing
# Solution: Test build locally
npm run build
# Fix any issues found

# Problem: Environment variables not working
# Solution: Check Vercel dashboard settings
# - Verify all variables are set
# - Check variable names match exactly
```

---

## ✅ Success Indicators

After successful migration, you should have:

- [ ] 🟢 Zero TypeScript errors in production builds
- [ ] 🟢 Automated code quality checks before every commit
- [ ] 🟢 CI/CD pipeline running on all PRs
- [ ] 🟢 Automatic deployments to staging and production
- [ ] 🟢 Preview URLs for all feature branches
- [ ] 🟢 Real-time TypeScript validation in VS Code
- [ ] 🟢 Team can focus on features, not deployment issues

### Metrics to Track

- Deployment success rate (should be 100%)
- Time from commit to deployment (should be < 5 minutes)
- TypeScript errors in production (should be 0)
- Developer satisfaction (should be much higher!)

---

_This migration guide is based on the comprehensive pipeline documented in [DEPLOYMENT_PIPELINE.md](./DEPLOYMENT_PIPELINE.md)_
