import { createBrowserClient } from '@supabase/ssr';
import { supabaseConfig } from './client-config';
import { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export function getSupabaseBrowserClient() {
  if (client) {
    return client;
  }

  client = createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);

  return client;
}
