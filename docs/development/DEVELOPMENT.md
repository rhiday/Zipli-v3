# Development Pipeline - Quick Reference

> **📖 For comprehensive documentation, see [DEPLOYMENT_PIPELINE.md](./DEPLOYMENT_PIPELINE.md)**

## Branch Strategy

- **main**: Production environment (auto-deploys to live site)
- **develop**: Staging environment (auto-deploys to preview URLs)
- **feature/\***: Feature branches (auto-deploys to temporary preview URLs)

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
- ✅ **Database migration verification** (see [Database Migration Best Practices](./DATABASE_MIGRATION_BEST_PRACTICES.md))

## Quick Commands

```bash
# Development
npm run dev            # Start development server
npm run validate       # Run all quality checks locally

# Before committing (automatic via pre-commit hooks)
npm run type-check     # TypeScript validation
npm run lint:fix       # Fix ESLint issues
npm run format         # Format code with Prettier

# Building
npm run build          # Production build
npm run build:check    # Build and start (test production mode)
```

## VS Code Integration

The pipeline includes VS Code workspace settings for:

- Real-time TypeScript error detection
- Automatic ESLint fixing on save
- Prettier formatting on save
- Enhanced IntelliSense with type hints

## Need Help?

- **Full Setup Guide**: [DEPLOYMENT_PIPELINE.md](./DEPLOYMENT_PIPELINE.md)
- **Troubleshooting**: See troubleshooting section in main documentation
- **Migration Checklist**: For setting up similar pipeline in other projects
