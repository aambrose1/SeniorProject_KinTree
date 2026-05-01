require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Server-side Supabase client using the Service Role key
// Note: Do not expose the service role key to the client.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
  }
);

module.exports = supabase;


