# V2 Redesign & Refactor Plan

This document outlines the strategy and steps for the V2 redesign of the Zipli application. All work for this redesign should be committed to the `epic/v2-redesign` branch.

Refer to the [main documentation index](./README.md) for a complete overview of all project documents.

## Implementation Checklist

### Phase 1: Design System Foundation
- [ ] **Export New Tokens:** Export all design tokens (colors, typography, spacing, radii) from the new Figma file.
- [ ] **Update Token File:** Replace the contents of `tokens/figma.tokens.json` with the new export.
- [ ] **Process Tokens:** Run Style Dictionary (`npx style-dictionary build`) to generate `tokens/tokens.css` and `tokens/tailwind.colors.js`.
- [ ] **Update Tailwind Config:** Modify `tailwind.config.js` to reflect the new design system (colors, fonts, spacing, etc.), ideally by importing from the generated token files.
- [ ] **Update Global CSS:**
    - [ ] Update `src/app/globals.css` with new base styles.
    - [ ] Define the necessary shadcn/ui CSS variables (`--background`, `--primary`, `--card`, etc.) in `globals.css` based on the new tokens.
- [ ] **Update Fonts:** Update the `next/font` setup in `src/app/layout.tsx` if new fonts or weights are required.
- [ ] **Update Atomic Components:**
    - [ ] Refactor `src/components/ui/button.tsx` to match the new design system.
    - [ ] Refactor `src/components/ui/input.tsx`.
    - [ ] Refactor other core UI components (`card`, `dialog`, `select`, etc.).
    - [ ] Update Storybook stories for all modified components.

### Phase 2: Backend & Core Logic
- [ ] **Identify Schema Changes:** Determine if any database schema changes are needed for the new app logic.
- [ ] **Create Migrations:** If needed, create new Supabase migration files for schema changes.
- [ ] **Update API Endpoints:** Modify or create new API routes in `/app/api/` to support the new features.

### Phase 3: UI & Feature Integration
- [ ] **Refactor Individual Pages:** Go through the application page by page, updating the layout and components to use the new design system and logic.
- [ ] **Connect to New Logic:** Wire up the new UI to the updated backend logic and API endpoints.
- [ ] **Thorough Testing:** Conduct end-to-end testing of all features on the `epic/v2-redesign` branch. 