
import { createClient } from '@supabase/supabase-js';

// This file runs in the app/ (client) bundle — never use the service role key here.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Supabase instance avec la clé service role (usage serveur uniquement)
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

