# Environment Setup Guide

## Required Environment Variables

This project requires several environment variables to function properly. Follow these steps to set them up:

### 1. Create Environment File

```bash
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your actual values:

#### OpenAI API Key

- Get your API key from https://platform.openai.com/api-keys
- Set `OPENAI_API_KEY=sk-your-actual-key-here`

#### Supabase Configuration

- Get these values from your Supabase project dashboard
- Set `NEXT_PUBLIC_SUPABASE_URL` to your project URL
- Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your anon/public key
- Set `SUPABASE_SERVICE_ROLE_KEY` to your service role key

#### Storage Configuration

- Set `SUPABASE_STORAGE_BUCKET=donations` (or your bucket name)

### 3. Security Notes

⚠️ **NEVER commit `.env.local` to git!**

- The `.env.local` file contains sensitive API keys
- It's already excluded via `.gitignore`
- Use `.env.example` as a template for other developers
- In production, set these as environment variables on your platform

### 4. Development vs Production

- **Development**: Use `.env.local` file
- **Production**: Set environment variables through your hosting platform
- **CI/CD**: Use secure environment variable storage

## Troubleshooting

If you see errors about missing environment variables:

1. Ensure `.env.local` exists in the project root
2. Verify all required variables are set
3. Restart your development server after adding variables
4. Check that variable names match exactly (including prefixes)
