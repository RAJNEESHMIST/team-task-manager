import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kcrkfpehhvnaokbiawtc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Hbgqxmnjmdywk5NMsk7xCw_XCEfepWW';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
