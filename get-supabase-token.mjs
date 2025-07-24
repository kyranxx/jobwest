import { createClient } from './lib/utils/supabase/client.js';

const supabase = createClient();

supabase.auth.getSession().then(({ data }) => {
  console.log(data.session.access_token);
});
