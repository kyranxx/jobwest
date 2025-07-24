import { getSupabaseBrowserClient } from './client';
import type { User } from '@supabase/supabase-js';

export async function getUserProfile(user: User) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id);

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data?.[0];
}
