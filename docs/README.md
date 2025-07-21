# Zipli Project Documentation

Welcome to the central documentation hub for the Zipli project. This directory contains all relevant documents for understanding the project's architecture, goals, and conventions.

## Documentation Index

### 1. Project & Feature Planning
- [**V2 Redesign & Refactor Plan**](./refactor_plan.md)
  - _The master checklist and plan for the V2 redesign effort._
- [**Product Requirements Document (PRD)**](./product_requirements.md)
  - _Outlines the goals, features, and requirements for Version 2 of the application._

### 2. Technical Documentation & Notes
- [**Supabase Notes & Implementation Details**](./supabase_notes.md)
  - _Contains specific notes on Supabase setup, policies (RLS), and lessons learned during development._

### 3. Development Environment & Conventions
- [**Cursor AI Rules**](./cursor_rules.md)
  - _Defines the rules and guidelines for the AI pair-programming assistant._

## "Living" Documentation

Some of our most important documentation isn't in this `docs/` folder. Instead, it lives alongside the code and is always up-to-date.

### Component Library & Style Guide (Storybook)
Our UI components are documented in Storybook. This provides an interactive style guide and a way to view components in isolation.

To run the style guide locally:
```bash
pnpm run storybook
```

### Configuration as Documentation
The project's architecture and setup are defined in these key files:
- `package.json`: Lists all project dependencies and scripts.
- `tailwind.config.js`: Defines the theme and styling utilities (colors, spacing, typography).
- `style-dictionary.config.mjs`: Defines the pipeline for converting design tokens from Figma into usable code.
- `components.json`: Defines how `shadcn/ui` components are configured and where they are located. 