import { createClient } from "@supabase/supabase-js";

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

// Force redeploy 20260608184924
