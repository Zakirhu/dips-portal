import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = 'rqqjqflxbtfcrbywwtpc';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Rpydb7voi4Ent3T2exz8qQ_TsaaTtH4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
