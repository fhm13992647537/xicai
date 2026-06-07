code = '''import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { formatTime } from '../utils/helpers';

export default function ChatPage() {
  const navigate = useNavigate();
  const { currentUser, showToast } = useAuth();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!currentUser) return;
    try {
      const { data: fList } = await supabase.from('friendships').select('friend_id').eq('user_id', currentUser.id);
      const fIds = (fList || []).map(f => f.friend_id);
      if (fIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, username, name, avatar_url').in('id', fIds);
        setFriends(profiles || []);
      } else { setFriends([]); }
    } catch (err) { console.error(err); }
  }, [currentUser]);

  const fetchRequests = useCallback(async () => {
    if (!currentUser) return;
    try {
      const { data } = await supabase.from('friend_requests').select('id, status, created_at, from_user:profiles!from_user(id, username, name, avatar_url)').eq('to_user', currentUser.id).eq('status', 'pending');
      setRequests(data || []);
    } catch (err) { console.error(err); }
  }, [currentUser]);

  const loadAll = useCallback(async () => { setLoading(true); await Promise.all([fetchFriends(), fetchRequests()]); setLoading(false); }, [fetchFriends, fetchRequests]);
  useEffect(() => { loadAll(); }, [loadAll]);

  const handleAccept = async (req) => {
    try {
      await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', req.id);
      await supabase.rpc('add_friendship', { user1: currentUser.id, user2: req.from_user.id });
      showToast('已添加好友', 'success');
      loadAll();
    } catch { showToast('操作失败', 'error'); }
  };

  const handleReject = async (req) => {
    try { await supabase.from('friend_requests').update({ status: 'rejected' }).eq('id', req.id); showToast('已拒绝', 'info'); loadAll(); }
    catch { showToast('操作失败', 'error'); }
  };

  const handleDeleteFriend = async (friendId) => {
    if (!window.confirm('确定删除该好友？聊天记录将被清空。')) return;
    try {
      await Promise.all([supabase.from('friendships').delete().eq('user_id', currentUser.id).eq('friend_id', friendId), supabase.from('friendships').delete().eq('user_id', friendId).eq('friend_id', currentUser.id)]);
      showToast('已删除好友', 'info'); loadAll();
    } catch { showToast('操作失败', 'error'); }
  };

  if (!currentUser) return React.createElement('div', { className: 'flex flex-col items-center justify-center py-20 text-gray-400' }, React.createElement('p', null, '请先登录'));

  return React.createElement('div', { className: 'pb-4' },
    React.createElement('div', { className: 'sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3' },
      React.createElement('h1', { className: 'text-lg font-bold text-gray-900' }, '聊天')
    ),
    React.createElement('div', { className: 'px-4 pt-3' },
      requests.length > 0 && React.createElement('div', { className: 'mb-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-700 mb-2' }, '好友请求 (' + requests.length + ')'),
        requests.map(req => {
          const fn = req.from_user?.name || req.from_user?.username || '用户';
          return React.createElement('div', { key: req.id, className: 'flex items-center gap-3 p-3 card mb-2' },
            React.createElement('div', { className: 'w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0' }, fn[0]),
            React.createElement('div', { className: 'flex-1 min-w-0' },
              React.createElement('p', { className: 'text-sm font-medium text-gray-900 truncate' }, fn),
              React.createElement('p', { className: 'text-xs text-gray-400' }, formatTime(req.created_at))
            ),
            React.createElement('div', { className: 'flex gap-2' },
              React.createElement('button', { onClick: () => handleAccept(req), className: 'btn-primary text-xs py-1.5 px-3' }, '同意'),
              React.createElement('button', { onClick: () => handleReject(req), className: 'btn-outline text-xs py-1.5 px-3 border-gray-300 text-gray-600' }, '拒绝')
            )
          );
        })
      ),
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-700 mb-2' }, '我的好友'),
      loading
        ? React.createElement('div', { className: 'flex justify-center py-10' }, React.createElement('div', { className: 'animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent' }))
        : friends.length === 0
          ? React.createElement('div', { className: 'text-center py-16 text-gray-400' }, React.createElement('p', null, '暂无好友，去添加朋友吧'))
          : React.createElement('div', { className: 'space-y-1' },
              friends.map(f => React.createElement('div', { key: f.id, className: 'flex items-center gap-3 p-3 card cursor-pointer active:bg-gray-50', onClick: () => navigate('/chat/' + f.id), onContextMenu: (e) => { e.preventDefault(); handleDeleteFriend(f.id); } },
                React.createElement('div', { className: 'w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0', style: f.avatar_url ? { backgroundImage: 'url(' + f.avatar_url + ')', backgroundSize: 'cover' } : {} }, !f.avatar_url ? (f.name || f.username || '?')[0] : null),
                React.createElement('div', { className: 'flex-1 min-w-0' }, React.createElement('p', { className: 'text-sm font-medium text-gray-900' }, f.name || f.username)),
                React.createElement('button', { onClick: (e) => { e.stopPropagation(); handleDeleteFriend(f.id); }, className: 'text-xs text-red-400 hover:text-red-600 px-2' }, '删除')
              ))
            )
    )
  );
}
'''
with open(r'C:\Users\付建康\Documents\Codex\2026-06-06\web-react-tailwind-css-leancloud-vercel\campus-circle\src\pages\ChatPage.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('ChatPage written')
