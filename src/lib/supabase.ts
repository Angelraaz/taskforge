import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://yssttxgbzcotsdcyxcnb.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzc3R0eGdiemNvdHNkY3l4Y25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNTQ2MjksImV4cCI6MjEwNzczMDYyOX0.VT__5qNY-xE6tX_S6veQydTphf1voD2C9Y2GgSsudRU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
