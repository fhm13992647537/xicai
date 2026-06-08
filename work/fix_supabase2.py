code = '''import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://wqvxiufkqgrlbnmbqhgr.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_WqJHkrFmvr9ZdwUAz8ASyg_iCFG4nxS";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };
export default supabase;
'''
with open(r'C:\Users\付建康\Documents\Codex\2026-06-06\web-react-tailwind-css-leancloud-vercel\campus-circle\src\config\supabase.js', 'w', encoding='utf-8') as f:
    f.write(code)
print('Hardcoded values written')
