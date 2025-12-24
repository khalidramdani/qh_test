
import { createClient } from '@supabase/supabase-js';

// This file runs in the app/ (client) bundle — never use the service role key here.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client-side Supabase instance (public anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

