# Zipli Developer Documentation

> **Comprehensive documentation for developers working on the Zipli food donation platform**

Welcome to the Zipli developer documentation. This is your central hub for understanding, developing, and maintaining the Zipli platform.

---

## 🚀 Quick Links

| Section                                              | Description                           | Start Here                                                |
| ---------------------------------------------------- | ------------------------------------- | --------------------------------------------------------- |
| **[Getting Started](./01-getting-started/index.md)** | Setup and run the project             | [Quick Start Guide](./01-getting-started/quick-start.md)  |
| **[Architecture](./02-architecture/index.md)**       | System design and technical decisions | [System Overview](./02-architecture/system-design.md)     |
| **[Development](./03-development/index.md)**         | Coding standards and patterns         | [Component Guide](./03-development/component-patterns.md) |
| **[Deployment](./04-deployment/index.md)**           | Deploy to production                  | [Deployment Guide](./04-deployment/vercel-setup.md)       |
| **[API Reference](./05-api-reference/index.md)**     | Complete API documentation            | [REST Endpoints](./05-api-reference/rest-endpoints.md)    |
| **[Decisions](./06-decisions/index.md)**             | Architecture decision records         | [Why These Changes](./06-decisions/performance-fixes.md)  |

---

## 📚 Documentation Structure

```
docs/
├── 01-getting-started/     # Setup, installation, first steps
├── 02-architecture/         # System design, database, components
├── 03-development/          # Coding guides, patterns, testing
├── 04-deployment/           # Production deployment, monitoring
├── 05-api-reference/        # API docs, types, methods
└── 06-decisions/           # Architecture decision records (ADRs)
```

---

## 🎯 For Different Roles

### **New Developers**

1. Start with [Quick Start Guide](./01-getting-started/quick-start.md)
2. Review [Component Architecture](./02-architecture/component-architecture.md)
3. Follow [Development Standards](./03-development/code-standards.md)

### **Frontend Developers**

- [Component Patterns](./03-development/component-patterns.md)
- [UI Component Map](./02-architecture/component-dependency-map.md)
- [Design System Guide](./03-development/design-system.md)

### **Backend Developers**

- [Database Schema](./02-architecture/database-schema.md)
- [API Reference](./05-api-reference/rest-endpoints.md)
- [Supabase Integration](./02-architecture/supabase-integration.md)

### **DevOps Engineers**

- [Deployment Pipeline](./04-deployment/deployment-pipeline.md)
- [Monitoring Setup](./04-deployment/monitoring.md)
- [Performance Guide](./02-architecture/performance-optimizations.md)

---

## 🔍 Search Documentation

Use `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) to search all documentation.

---

## 📊 Current System Status

### **Performance Metrics**

- **Capacity**: 500+ concurrent users
- **Response Time**: <200ms average
- **Database Queries**: <100ms with indexes
- **Build Status**: ✅ Passing
- **Test Coverage**: 73%

### **Technology Stack**

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS, CVA
- **State**: Zustand
- **Deployment**: Vercel
- **Monitoring**: Custom + Vercel Analytics

---

## 🚨 Important Resources

### **Critical Documentation**

- [Production Readiness Checklist](./04-deployment/production-checklist.md)
- [Security Best Practices](./03-development/security.md)
- [Troubleshooting Guide](./04-deployment/troubleshooting.md)
- [Emergency Procedures](./04-deployment/emergency.md)

### **Recent Updates**

- **2024-08-21**: Major performance optimizations for 500+ users
- **2024-08-21**: Security hardening (crypto tokens, env validation)
- **2024-08-21**: Documentation consolidation
- **2024-08-13**: Supabase migration completed

---

## 🤝 Contributing

### **Documentation Standards**

- Use Markdown for all documentation
- Include code examples with syntax highlighting
- Add diagrams for complex concepts
- Keep documentation up-to-date with code changes

### **Updating Documentation**

1. Edit relevant `.md` files in `/docs`
2. Update the index if adding new sections
3. Test in the web viewer at `/docs` route
4. Commit with descriptive message

---

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-repo/issues)
- **Internal Slack**: #zipli-dev channel
- **Documentation Issues**: Create issue with `docs` label

---

## 🔄 Version History

| Version | Date       | Changes                         |
| ------- | ---------- | ------------------------------- |
| 2.0.0   | 2024-08-21 | Complete documentation overhaul |
| 1.5.0   | 2024-08-21 | Performance optimizations       |
| 1.0.0   | 2024-08-13 | Supabase migration              |

---

**Last Updated**: August 21, 2024  
**Maintained By**: Zipli Development Team
