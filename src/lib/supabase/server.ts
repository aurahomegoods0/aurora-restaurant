import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const sessionless = {
  auth: { persistSession: false, autoRefreshToken: false },
} as const;

/**
 * Stateless Supabase client for server actions / route handlers.
 * Uses the anon key, so every query is still subject to RLS.
 */
export const createServerSupabaseClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, sessionless);
};

/**
 * Privileged client that bypasses RLS. Only for trusted server code that has
 * already authenticated its caller (e.g. the Telegram webhook). Never import
 * this from client components.
 */
export const createServiceRoleSupabaseClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, sessionless);
};
