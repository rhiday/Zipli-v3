# Development Pipeline

## Branch Strategy

- **main**: Production environment (auto-deploys to live site)
- **develop**: Staging environment (auto-deploys to preview URLs)
- **feature/***: Feature branches (auto-deploys to temporary preview URLs)

## Environments

- **Production**: https://your-production-url.vercel.app (from `main`)
- **Staging**: Preview URLs from `develop` branch  
- **Feature Previews**: Temporary URLs from feature branches

## Development Workflow

1. Create feature branch from `develop`
2. Develop with real-time TypeScript validation
3. Push to get automatic preview deployment
4. Create PR to `develop` → triggers automated tests
5. Merge to `develop` → deploys to staging for testing
6. Create PR from `develop` to `main` → final review + production deploy

## Quality Gates

- ✅ Pre-commit hooks (TypeScript + ESLint)
- ✅ Automated testing on PRs
- ✅ Branch protection on main
- ✅ Required status checks before merge