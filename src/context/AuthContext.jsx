import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const register = async (username, password, name) => { const email = username + '@campus.dev'; const {data,error} = await supabase.auth.signUp({email,password,options:{data:{name}}}); if(error){ if(error.message && (error.message.includes('already registered')||error.message.includes('already exists'))) throw new Error('该账号已被注册'); throw error; } if(data.user){setCurrentUser(data.user); const p=await fetchProfile(data.user.id); setProfile(p); setIsAdmin(false);} showToast('注册成功，欢迎加入校园圈！','success'); };
  const login = async (username, password) => { const email = username + '@campus.dev'; const {data,error} = await supabase.auth.signInWithPassword({email,password}); if(error){ if(error.status===400) throw new Error('账号或密码错误'); throw error; } setCurrentUser(data.user); const p=await fetchProfile(data.user.id); setProfile(p); const admin=p&&p.role==='admin'; setIsAdmin(admin); showToast(admin ? '已切换为管理员身份' : '登录成功', admin?'info':'success'); };
  const logout = async () => { await supabase.auth.signOut(); setCurrentUser(null);setProfile(null);setIsAdmin(false); showToast('已退出登录','info'); };
  const adminLogin = async (username, password) => { const email = username + '@campus.dev'; const {data,error} = await supabase.auth.signInWithPassword({email,password}); if(error) throw new Error('账号或密码错误'); const p=await fetchProfile(data.user.id); if(!p||p.role!=='admin'){await supabase.auth.signOut(); throw new Error('该账号不是管理员');} setCurrentUser(data.user); setProfile(p); setIsAdmin(true); showToast('已切换为管理员身份','info'); };
  const updateProfile = async (updates) => { if(!currentUser) return; const {data,error} = await supabase.from('profiles').update(updates).eq('id',currentUser.id).select().single(); if(error) throw error; setProfile(data); };
  const refreshProfile = async () => { if(!currentUser) return; const p = await fetchProfile(currentUser.id); setProfile(p); setIsAdmin(p&&p.role==='admin'); };
  const value = { currentUser, profile, isAdmin, loading, toasts, showToast, login, register, logout, adminLogin, updateProfile, refreshProfile };
  return React.createElement(AuthContext.Provider, { value }, children);
}
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('请确保AuthProvider已包裹组件'); return ctx; }