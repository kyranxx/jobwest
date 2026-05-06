import { createBrowserClient } from '@supabase/ssr';
import { supabaseConfig } from './client-config';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

let client: SupabaseClient<Database> | undefined;

export function getSupabaseBrowserClient() {
  if (client) {
    return client;
  }

  client = createBrowserClient<Database>(supabaseConfig.url, supabaseConfig.anonKey);

  return client;
}
