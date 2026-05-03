import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://bobchgtijgkxhaxfnvci.supabase.co/';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvYmNoZ3RpamdreGhheGZudmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NDk2OTMsImV4cCI6MjA3NTQyNTY5M30.3YH0lpoRH0lqKrj2TiOJSOPKhXDO7ULw9lPZeBkU3Bo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
