code = '''import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../config/supabase';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((msg, type) => { const t = type || 'info'; const id = Date.now(); setToasts(p => [...p, {id,message:msg,type:t}]); setTimeout(() => setToasts(p => p.filter(x => x.id!==id)), 3000); }, []);
  const fetchProfile = useCallback(async (userId) => { const r = await supabase.from('profiles').select('*').eq('id',userId).single(); return r.data; }, []);
  useEffect(() => {
    (async () => { try { const {data:{session}} = await supabase.auth.getSession(); if(session&&session.user){setCurrentUser(session.user); const p=await fetchProfile(session.user.id); setProfile(p); setIsAdmin(p&&p.role==='admin');} } catch(e){console.error(e)} finally{setLoading(false)} })();
    const {data:listener} = supabase.auth.onAuthStateChange(async (e,session)=>{ if(session&&session.user){setCurrentUser(session.user); const p=await fetchProfile(session.user.id); setProfile(p); setIsAdmin(p&&p.role==='admin');} else {setCurrentUser(null);setProfile(null);setIsAdmin(false);} });
    return ()=>{ if(listener&&listener.subscription) listener.subscription.unsubscribe(); };
  }, [fetchProfile]);
  const register = async (username, password, name) => { const email = username + '@campus.dev'; const {data,error} = await supabase.auth.signUp({email,password,options:{data:{name}}}); if(error){ if(error.message && (error.message.includes('already registered')||error.message.includes('already exists'))) throw new Error('\u8be5\u8d26\u53f7\u5df2\u88ab\u6ce8\u518c'); throw error; } if(data.user){setCurrentUser(data.user); const p=await fetchProfile(data.user.id); setProfile(p); setIsAdmin(false);} showToast('\u6ce8\u518c\u6210\u529f\uff0c\u6b22\u8fce\u52a0\u5165\u6821\u56ed\u5708\uff01','success'); };
  const login = async (username, password) => { const email = username + '@campus.dev'; const {data,error} = await supabase.auth.signInWithPassword({email,password}); if(error){ if(error.status===400) throw new Error('\u8d26\u53f7\u6216\u5bc6\u7801\u9519\u8bef'); throw error; } setCurrentUser(data.user); const p=await fetchProfile(data.user.id); setProfile(p); const admin=p&&p.role==='admin'; setIsAdmin(admin); showToast(admin ? '\u5df2\u5207\u6362\u4e3a\u7ba1\u7406\u5458\u8eab\u4efd' : '\u767b\u5f55\u6210\u529f', admin?'info':'success'); };
  const logout = async () => { await supabase.auth.signOut(); setCurrentUser(null);setProfile(null);setIsAdmin(false); showToast('\u5df2\u9000\u51fa\u767b\u5f55','info'); };
  const adminLogin = async (username, password) => { const email = username + '@campus.dev'; const {data,error} = await supabase.auth.signInWithPassword({email,password}); if(error) throw new Error('\u8d26\u53f7\u6216\u5bc6\u7801\u9519\u8bef'); const p=await fetchProfile(data.user.id); if(!p||p.role!=='admin'){await supabase.auth.signOut(); throw new Error('\u8be5\u8d26\u53f7\u4e0d\u662f\u7ba1\u7406\u5458');} setCurrentUser(data.user); setProfile(p); setIsAdmin(true); showToast('\u5df2\u5207\u6362\u4e3a\u7ba1\u7406\u5458\u8eab\u4efd','info'); };
  const updateProfile = async (updates) => { if(!currentUser) return; const {data,error} = await supabase.from('profiles').update(updates).eq('id',currentUser.id).select().single(); if(error) throw error; setProfile(data); };
  const refreshProfile = async () => { if(!currentUser) return; const p = await fetchProfile(currentUser.id); setProfile(p); setIsAdmin(p&&p.role==='admin'); };
  const value = { currentUser, profile, isAdmin, loading, toasts, showToast, login, register, logout, adminLogin, updateProfile, refreshProfile };
  return React.createElement(AuthContext.Provider, { value }, children);
}
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('\u8bf7\u786e\u4fddAuthProvider\u5df2\u5305\u88f9\u7ec4\u4ef6'); return ctx; }'''
with open(r'C:\Users\付建康\Documents\Codex\2026-06-06\web-react-tailwind-css-leancloud-vercel\campus-circle\src\context\AuthContext.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done')
