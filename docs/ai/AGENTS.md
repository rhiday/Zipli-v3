# Repository Guidelines

## Project Structure & Module Organization

- `src/app`: Next.js app routes, layouts, pages, and styles.
- `src/components`, `src/lib`, `src/hooks`, `src/store`, `src/types`: Reusable UI, utilities, state, and TypeScript types.
- `tests`: Jest tests and setup (`tests/setup.ts`). Test files: `*.test.ts(x)`.
- `public`: Static assets. `scripts/`: automation (e.g., `lokalise`, seeds, cleanup).
- `docs/`: Architecture and process docs. `.storybook/`: Storybook config.

## Build, Test, and Development Commands

- `npm run dev`: Start Next.js dev server.
- `npm run build`: Production build (supports `ANALYZE=true`).
- `npm run start`: Serve built app.
- `npm run test` / `test:watch` / `test:coverage`: Run Jest (jsdom). Coverage thresholds are enforced.
- `npm run type-check`: TypeScript checks (no emit).
- `npm run lint` / `lint:fix`: ESLint for TS/JS.
- `npm run format` / `format:check`: Prettier formatting.
- `npm run validate`: Type-check, lint, and tests together.

## Coding Style & Naming Conventions

- TypeScript strict mode; Node >= 18.
- Formatting via Prettier: 2 spaces, 80-char width, single quotes, trailing commas (es5).
- ESLint base: Next.js core-web-vitals; key rules: no-unused-vars (warn), allow `<img>`.
- Paths use `@/*` alias to `src/*`.
- Names: components `PascalCase.tsx`, hooks `useThing.ts`, utilities `camelCase.ts`, tests mirror source names: `Component.test.tsx`.

## Testing Guidelines

- Framework: Jest + Testing Library (`jsdom`).
- Location: `tests/**/*.test.ts(x)`; setup in `tests/setup.ts`.
- Coverage: global 70% (branches, functions, lines, statements).
- Run `npm run test:coverage` before PRs.

## Commit & Pull Request Guidelines

- Prefer Conventional Commits: `feat:`, `fix:`, `chore(scope):`, `docs:`, `refactor:`.
- PRs: clear description, linked issues, screenshots for UI changes, and steps to verify.
- CI expectations: pass `npm run validate` and maintain coverage.

## Security & Configuration

- Secrets go in `.env.local` (see `.env.example`). Do not commit real keys.
- Supabase and i18n scripts live in `scripts/`; use provided `lokalise:*` tasks for translations.
