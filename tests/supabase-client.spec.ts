import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const moduleRelativePath = './src/lib/supabase/client.ts';

const runNodeScript = (code: string) => {
  const env = { ...process.env };
  delete env.NEXT_PUBLIC_SUPABASE_URL;
  delete env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return spawnSync('node', ['-r', 'ts-node/register/transpile-only', '-e', code], {
    cwd: projectRoot,
    env,
    encoding: 'utf-8',
  });
};

test.describe('supabase client environment guards', () => {
  test('module evaluates without supabase env vars', async () => {
    const script = `require('${moduleRelativePath}');`;
    const result = runNodeScript(script);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });

  test('getSupabaseClient throws a helpful error when env vars are missing', async () => {
    const script = String.raw`
const { getSupabaseClient } = require('${moduleRelativePath}');
try {
  getSupabaseClient();
  console.error('Expected getSupabaseClient to throw');
  process.exit(1);
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message);
  } else {
    console.log(String(error));
  }
}
`;

    const result = runNodeScript(script);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      'Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  });
});
