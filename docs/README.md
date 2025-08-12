# Zipli Project Documentation

Welcome to the central documentation hub for the Zipli project. This directory contains all relevant documents for understanding the project's architecture, goals, and development workflow.

## 📚 Documentation Categories

### 🎯 Current Development (Active)
- [**Feature Development Plan**](./feature-development-plan.md)
  - _Master plan for current feature development using short-lived branches_
- [**Finnish Multilingual Support**](./features/finnish-multilingual.md)
  - _Complete internationalization and Finnish language implementation_
- [**Content Improvements**](./features/content-improvements.md)
  - _Enhanced copy, messaging, and user guidance throughout the platform_
- [**Design Improvements**](./features/design-improvements.md)
  - _Visual design enhancements, UI improvements, and accessibility upgrades_

### 🏗️ Project Foundation
- [**Architecture Overview**](./architecture-overview.md)
  - _System architecture, data flow, and technical implementation guide_
- [**Product Requirements Document (PRD)**](./product_requirements.md)
  - _Core project goals, features, and technical requirements_
- [**API Documentation**](./api-documentation.md)
  - _Complete API reference for authentication, donations, and AI features_

### 🔧 Technical Implementation
- [**Supabase Implementation Notes**](./supabase_notes.md)
  - _Database setup, RLS policies, and troubleshooting guide_
- [**Development Environment Setup**](./cursor_rules.md)
  - _AI pair-programming rules and development conventions_

### 📜 Historical Reference
- [**V2 Redesign & Refactor Plan**](./refactor_plan.md) _(Completed)_
  - _Historical record of the V2 redesign effort - now completed and merged to main_

## 🚀 Quick Start Guide

### For New Developers
1. Read the [**PRD**](./product_requirements.md) to understand the project scope
2. Review [**API Documentation**](./api-documentation.md) for technical integration
3. Check [**Supabase Notes**](./supabase_notes.md) for database setup
4. Follow [**Feature Development Plan**](./feature-development-plan.md) for current work

### For Current Development
1. Choose a feature from the [**Feature Development Plan**](./feature-development-plan.md)
2. Switch to the appropriate feature branch
3. Follow the detailed specification in the `features/` directory
4. Use the short-lived branch workflow for development

## 🔄 Living Documentation

### Component Library & Style Guide
Interactive component documentation via Storybook:
```bash
pnpm run storybook
```

### Configuration Documentation
Key configuration files that serve as documentation:
- `package.json` - Dependencies and scripts
- `tailwind.config.js` - Design system and styling
- `supabase/schema.sql` - Database structure
- `components.json` - UI component configuration

## 📊 Project Status

### ✅ Completed Features
- V2 redesign with modern UI components
- Voice input for donations and requests
- AI-powered food item processing
- QR code authentication system
- Multi-step donation and request flows
- Real-time updates and notifications

### 🚧 In Development
- Finnish multilingual support
- Content and messaging improvements
- Visual design enhancements

### 🔮 Future Roadmap
- Push notifications
- Map integration for pickup locations
- React Native mobile app
- Advanced analytics dashboard

---

**Last Updated**: December 2024  
**Current Version**: v2.0 (with ongoing feature development)  
**Next Major Release**: v2.1 (Finnish multilingual + improvements)