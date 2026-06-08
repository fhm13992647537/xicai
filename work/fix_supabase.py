code = '''import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabase;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn("Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  supabase = { auth: { signUp: () => Promise.reject(new Error("Supabase not configured")), signInWithPassword: () => Promise.reject(new Error("Supabase not configured")), signOut: () => Promise.resolve(), getSession: () => Promise.resolve({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) }, from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }), order: () => Promise.resolve({ data: [] }) }), insert: () => Promise.reject(new Error("Supabase not configured")), update: () => Promise.reject(new Error("Supabase not configured")), delete: () => Promise.reject(new Error("Supabase not configured")) }), channel: () => ({ on: () => ({ subscribe: () => {} }) }), removeChannel: () => {}, rpc: () => Promise.reject(new Error("Supabase not configured")), storage: { from: () => ({ upload: () => Promise.reject(new Error("Supabase not configured")), getPublicUrl: () => ({ publicUrl: "" }) }) } };
}

export { supabase };
export default supabase;
'''
with open(r'C:\Users\付建康\Documents\Codex\2026-06-06\web-react-tailwind-css-leancloud-vercel\campus-circle\src\config\supabase.js', 'w', encoding='utf-8') as f:
    f.write(code)
print('Fixed supabase.js')
