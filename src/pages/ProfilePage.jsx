import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import supabase from '../config/supabase';
import AdminLogin from '../components/AdminLogin';

export default function ProfilePage() {
  const { currentUser, profile, isAdmin, logout, updateProfile, showToast } = useAuth();
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const fileRef = useRef(null);

  const handleUploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    try {
      const filePath = `${currentUser.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await updateProfile({ avatar_url: urlData.publicUrl });
      showToast('头像已更新', 'success');
    } catch { showToast('上传失败', 'error'); }
  };

  const handleSaveName = async () => {
    if (!name.trim()) { showToast('昵称不能为空', 'error'); return; }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      setEditingName(false);
      showToast('昵称已更新', 'success');
    } catch { showToast('保存失败', 'error'); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p>请先登录</p>
        <button onClick={() => {}} className="btn-primary mt-4 text-sm">去登录</button>
      </div>
    );
  }

  const avatarLetter = (profile?.name || profile?.username || '?')[0];

  return (
    <div className="pb-4">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">我的</h1>
      </div>

      <div className="px-4 pt-6">
        {/* 头像与昵称 */}
        <div className="flex flex-col items-center mb-8">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative group"
          >
            <div
              className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold mb-3 border-4 border-white shadow-lg"
              style={profile?.avatar_url ? { backgroundImage: `url(${profile.avatar_url})`, backgroundSize: 'cover' } : {}}
            >
              {!profile?.avatar_url && avatarLetter}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />

          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="input-field text-sm text-center w-32"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <button onClick={handleSaveName} className="btn-primary text-xs py-1 px-3" disabled={saving}>保存</button>
              <button onClick={() => setEditingName(false)} className="text-xs text-gray-400">取消</button>
            </div>
          ) : (
            <button onClick={() => { setName(profile?.name || ''); setEditingName(true); }} className="text-lg font-semibold text-gray-900 flex items-center gap-1 hover:text-primary-600">
              {profile?.name || '用户'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <p className="text-sm text-gray-400 mt-1">@{profile?.username || ''}</p>
          {isAdmin && (
            <span className="mt-2 px-3 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">当前为管理员身份</span>
          )}
        </div>

        {/* 菜单项 */}
        <div className="space-y-3">
          <div className="card divide-y divide-gray-50">
            <div className="flex items-center justify-between p-4 text-sm">
              <span className="text-gray-600">账号</span>
              <span className="text-gray-900">{profile?.username}</span>
            </div>
            <div className="flex items-center justify-between p-4 text-sm">
              <span className="text-gray-600">角色</span>
              <span className="text-gray-900">{isAdmin ? '管理员' : '普通用户'}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="w-full btn-danger text-sm">
            退出登录
          </button>

          <div className="text-center pt-6">
            <button
              onClick={() => setShowAdmin(true)}
              className="text-sm text-gray-400 hover:text-primary-600 transition-colors"
            >
              管理员登录
            </button>
          </div>
        </div>
      </div>

      {showAdmin && <AdminLogin onClose={() => setShowAdmin(false)} />}
    </div>
  );
}
