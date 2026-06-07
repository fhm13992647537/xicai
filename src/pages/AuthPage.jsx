import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError(''); setUsername(''); setPassword(''); setName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) { setError('请填写完整信息'); return; }
    if (mode === 'register' && !name.trim()) { setError('请输入昵称'); return; }
    if (mode === 'register' && !/^[a-zA-Z0-9]+$/.test(username.trim())) {
      setError('账号只能是纯数字、字母，或数字与字母的组合'); return;
    }
    setLoading(true);
    try {
      if (mode === 'login') await login(username.trim(), password);
      else await register(username.trim(), password, name.trim());
      navigate('/', { replace: true });
    } catch (err) { setError(err.message || '操作失败'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">校园圈</h1>
        <p className="text-sm text-gray-500 mt-1">记录校园生活的每一刻</p>
      </div>

      {/* 表单卡片 */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-5">
          {mode === 'login' ? '登录' : '注册'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">账号</label>
            <input type="text" className="input-field" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="请输入账号" autoComplete="username" disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="请输入密码" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} disabled={loading} />
          </div>
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)}
                  placeholder="你的对外展示昵称" autoComplete="nickname" disabled={loading} />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-700 leading-relaxed">
                  账号可以是纯数字、字母，或数字与字母的组合，不能包含特殊符号。每个账号只能注册一次，不可重复。
                </p>
              </div>
            </>
          )}
          {error && <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? '请稍候...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>
        <div className="mt-5 text-center">
          <button onClick={switchMode} className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors" disabled={loading}>
            {mode === 'login' ? '还没有账号？立即注册' : '已有账号？立即登录'}
          </button>
        </div>
      </div>
    </div>
  );
}
