# Zipli - Food Donation Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frhiday%2FZipli-v3&project-name=zipli-v3&repository-name=zipli-v3)

Zipli is a platform connecting food donors with people in need, reducing food waste and helping communities.

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
