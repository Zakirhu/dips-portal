import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = 'bckfzqysttnotbzudcxg';

function sanitizeSupabaseUrl(url?: string): string {
  if (!url) return 'https://' + SUPABASE_PROJECT_ID + '.supabase.co';
  let clean = url.trim();
  while (clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  const restIdx = clean.indexOf('/rest/v1');
  if (restIdx !== -1) {
    clean = clean.substring(0, restIdx);
  }
  return clean || 'https://' + SUPABASE_PROJECT_ID + '.supabase.co';
}

export const SUPABASE_URL = sanitizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);

export const SUPABASE_ANON_KEY = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy'
).trim();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
