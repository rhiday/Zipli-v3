# Zipli - Food Donation Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frhiday%2FZipli-v3&project-name=zipli-v3&repository-name=zipli-v3)

Zipli is a platform connecting food donors with people in need, reducing food waste and helping communities.

> **[📚 View Full Project Documentation](./docs/README.md)**

---

## V2 Redesign Progress

This project is currently undergoing a significant V2 redesign. All new work is being committed to the `epic/v2-redesign` branch.

### Implementation Checklist

#### Phase 1: Design System Foundation
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

#### Phase 2: Backend & Core Logic
- [ ] **Identify Schema Changes:** Determine if any database schema changes are needed for the new app logic.
- [ ] **Create Migrations:** If needed, create new Supabase migration files for schema changes.
- [ ] **Update API Endpoints:** Modify or create new API routes in `/app/api/` to support the new features.

#### Phase 3: UI & Feature Integration
- [ ] **Refactor Individual Pages:** Go through the application page by page, updating the layout and components to use the new design system and logic.
- [ ] **Connect to New Logic:** Wire up the new UI to the updated backend logic and API endpoints.
- [ ] **Thorough Testing:** Conduct end-to-end testing of all features on the `epic/v2-redesign` branch.

---

## Development

Install dependencies:

```bash
pnpm install
```

Run the app locally:

```bash
pnpm dev
```

## Deployment

1. Deploy to Vercel using the button above
2. Add the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

## Test Accounts

Actual login credentials for testing roles (password is 'password' for all):

- `Donor email` (Donor)
- `Receiver email` (Receiver)
- `City email` (City Admin)
- `Terminal email` (Terminal)

## Supabase Notes

For details on specific Supabase configurations, RLS debugging, and lessons learned during development, see [`SUPABASE_NOTES.md`](./SUPABASE_NOTES.md).

## Future Plans: Test Automation

- Implement end-to-end (E2E) and integration tests using Playwright (or a similar framework) to automate UI checks, component interactions, routing, and user flow validation.
- This will help cover unit tests and edge cases for increased stability and faster development cycles.

## Generating Food Item Images with DALL·E

To bulk-generate images for all food items using OpenAI DALL·E and upload them to Supabase Storage:

1. Set up your environment variables in `.env.local` or `.env`:
   ```
   OPENAI_API_KEY=sk-...
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_URL=https://vqtfcdnrgotgrnwwuryo.supabase.co
   SUPABASE_STORAGE_BUCKET=donations
   ```
2. Install dependencies:
   ```sh
   pnpm install openai @supabase/supabase-js dotenv node-fetch
   # or use npm/yarn
   ```
3. Run the script:
   ```sh
   node scripts/generate_food_images.js
   ```

- The script will skip items that already have an image.
- Images are uploaded to the `donations` bucket in Supabase Storage.
- The `image_url` field in the `food_items` table will be updated with the public URL.
