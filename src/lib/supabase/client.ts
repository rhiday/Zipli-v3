import { createClient, type SupabaseClient as SupabaseJsClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

let cachedClient: SupabaseJsClient<Database> | null = null;

const ensureEnvironment = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return { supabaseUrl, supabaseAnonKey };
};

const createSupabaseClient = () => {
  const { supabaseUrl, supabaseAnonKey } = ensureEnvironment();

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
};

export const getSupabaseClient = (): SupabaseJsClient<Database> => {
  if (!cachedClient) {
    cachedClient = createSupabaseClient();
  }

  return cachedClient;
};

export const supabase = new Proxy(
  {} as SupabaseJsClient<Database>,
  {
    get(_target, prop, receiver) {
      const client = getSupabaseClient();
      const value = Reflect.get(client, prop, receiver);

      if (typeof value === 'function') {
        return value.bind(client);
      }

      return value;
    },
  }
) as SupabaseJsClient<Database>;

export type SupabaseClient = SupabaseJsClient<Database>;
