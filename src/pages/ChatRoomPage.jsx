import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { formatTime } from '../utils/helpers';

export default function ChatRoomPage() {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { currentUser, profile, showToast } = useAuth();
  const [friend, setFriend] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!currentUser || !friendId) return;
    supabase.from('profiles').select('*').eq('id', friendId).single().then(r => { if (r.data) setFriend(r.data); else navigate('/chat'); }).catch(() => navigate('/chat'));
  }, [friendId, currentUser, navigate]);

  useEffect(() => {
    if (!currentUser || !friendId) return;
    supabase.from('chat_members').select('chat_id').eq('user_id', currentUser.id).then(async r1 => {
      const myIds = (r1.data || []).map(c => c.chat_id);
      if (myIds.length > 0) {
        const r2 = await supabase.from('chat_members').select('chat_id').eq('user_id', friendId).in('chat_id', myIds);
        if (r2.data && r2.data.length > 0) { setChatId(r2.data[0].chat_id); return; }
      }
      const r3 = await supabase.from('chats').insert({}).select().single();
      if (r3.error) { console.error(r3.error); return; }
      await supabase.from('chat_members').insert([{ chat_id: r3.data.id, user_id: currentUser.id }, { chat_id: r3.data.id, user_id: friendId }]);
      setChatId(r3.data.id);
    });
  }, [currentUser, friendId]);

  const loadMessages = useCallback(async () => {
    if (!chatId) return;
    const { data } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true });
    setMessages(data || []);
    setLoading(false);
  }, [chatId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    if (!chatId) return;
    const channel = supabase.channel('chat_' + chatId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'chat_id=eq.' + chatId },
        (payload) => { setMessages(prev => [...prev, payload.new]); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [chatId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !chatId) return;
    setSending(true);
    try {
      const r = await supabase.from('messages').insert({ chat_id: chatId, sender_id: currentUser.id, sender_name: profile?.name || currentUser.email?.split('@')[0] || '用户', text: text.trim() });
      if (r.error) { console.error(r.error); showToast('发送失败: ' + r.error.message, 'error'); }
      else setText('');
    } catch (err) { console.error(err); showToast('发送失败', 'error'); }
    finally { setSending(false); }
  };

  if (!currentUser) return React.createElement('div', { className: 'flex flex-col items-center justify-center py-20 text-gray-400' }, React.createElement('p', null, '请先登录'));
  const fl = (friend?.name || friend?.username || '?')[0];

  return React.createElement('div', { className: 'flex flex-col h-[calc(100vh-56px)]' },
    React.createElement('div', { className: 'bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center gap-3' },
      React.createElement('button', { onClick: () => navigate('/chat'), className: 'p-1 -ml-1' }, React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6 text-gray-700', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M15 19l-7-7 7-7' }))),
      React.createElement('div', { className: 'w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs', style: friend?.avatar_url ? { backgroundImage: 'url(' + friend.avatar_url + ')', backgroundSize: 'cover' } : {} }, !friend?.avatar_url ? fl : null),
      React.createElement('span', { className: 'font-medium text-gray-900' }, friend?.name || friend?.username || '用户')
    ),
    React.createElement('div', { className: 'flex-1 overflow-y-auto px-4 py-3 space-y-3' },
      loading ? React.createElement('div', { className: 'flex justify-center py-20' }, React.createElement('div', { className: 'animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent' }))
      : messages.length === 0 ? React.createElement('div', { className: 'text-center py-20 text-gray-400 text-sm' }, '开始聊天吧')
      : messages.map(msg => {
          const isMe = msg.sender_id === currentUser.id;
          return React.createElement('div', { key: msg.id, className: 'flex ' + (isMe ? 'justify-end' : 'justify-start') },
            React.createElement('div', { className: 'max-w-[75%] px-3 py-2 rounded-2xl text-sm ' + (isMe ? 'bg-primary-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md') },
              React.createElement('p', null, msg.text),
              React.createElement('p', { className: 'text-[10px] mt-0.5 ' + (isMe ? 'text-primary-200' : 'text-gray-400') }, formatTime(msg.created_at))
            )
          );
        })
    ),
    React.createElement('div', { ref: bottomRef }),
    React.createElement('form', { onSubmit: handleSend, className: 'bg-white border-t border-gray-200 p-3 flex items-center gap-2 safe-bottom z-50' },
      React.createElement('input', { type: 'text', className: 'flex-1 input-field text-sm py-2', value: text, onChange: e => setText(e.target.value), placeholder: '输入消息...', disabled: sending }),
      React.createElement('button', { type: 'submit', className: 'btn-primary text-sm py-2 px-4', disabled: sending || !text.trim() }, sending ? '发送中' : '发送')
    )
  );
}
