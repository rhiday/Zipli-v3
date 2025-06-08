# Zipli - Food Donation Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frhiday%2FZipli-v3&project-name=zipli-v3&repository-name=zipli-v3)

Zipli is a platform connecting food donors with people in need, reducing food waste and helping communities.

> **[📚 View Full Project Documentation](./docs/README.md)**

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
