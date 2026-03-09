import { createClient } from '@supabase/supabase-js';

// Server-side admin client (service role key — never expose to the browser).
// Import this in API routes instead of calling createClient() inline.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Browser-safe anon client for use in client components.
export const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);