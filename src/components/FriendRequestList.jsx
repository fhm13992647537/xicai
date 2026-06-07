import React, { useState, useEffect } from 'react';
import supabase from '../config/supabase';
import { useAuth } from '../context/AuthContext';

export default function FriendRequestList({ onAccept, onReject }) {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('friend_requests')
        .select('id, from_user:profiles!from_user(id, username, name, avatar_url)')
        .eq('to_user', currentUser.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      setRequests(data || []);
      setLoaded(true);
    };
    fetch();
  }, [currentUser]);

  if (!loaded || requests.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="text-sm font-semibold text-gray-700 mb-2 px-1">好友请求 ({requests.length})</div>
      {requests.map((req) => {
        const from = req.from_user;
        const name = from?.name || from?.username || '用户';
        return (
          <div key={req.id} className="flex items-center gap-3 p-3 card mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
              {name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
              <p className="text-xs text-gray-400">请求添加你为好友</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onAccept?.(req)} className="btn-primary text-xs py-1.5 px-3">同意</button>
              <button onClick={() => onReject?.(req)} className="btn-outline text-xs py-1.5 px-3 border-gray-300 text-gray-600">拒绝</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
