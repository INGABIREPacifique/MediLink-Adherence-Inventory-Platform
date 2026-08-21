import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Both values are safe to expose in frontend code -- the anon key only
// grants what Row Level Security policies allow, nothing more. The
// service-role key (which bypasses RLS) must NEVER go in frontend code.
if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing -- copy .env.example to .env.local and fill in your project URL + anon key.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
