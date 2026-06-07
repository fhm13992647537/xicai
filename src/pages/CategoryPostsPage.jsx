import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { getCategoryInfo } from '../utils/helpers';

export default function CategoryPostsPage() {
  const { key } = useParams();
  const navigate = useNavigate();
  const { currentUser, showToast } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPostIds, setLikedPostIds] = useState(new Set());

  const cat = getCategoryInfo(key);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('posts').select('*').eq('category', key).order('created_at', { ascending: false });
      const list = data || [];
      if (currentUser) {
        const { data: likes } = await supabase.from('likes').select('post_id').eq('user_id', currentUser.id);
        const ids = new Set((likes || []).map((l) => l.post_id));
        setLikedPostIds(ids);
        list.forEach((p) => { p._liked = ids.has(p.id); });
      }
      setPosts(list);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [key, currentUser]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleLike = async (post) => {
    if (!currentUser) { showToast('请先登录', 'error'); return; }
    const liked = likedPostIds.has(post.id);
    try {
      if (liked) {
        await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', currentUser.id);
        setLikedPostIds((prev) => { const n = new Set(prev); n.delete(post.id); return n; });
        setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, like_count: Math.max(p.like_count - 1, 0), _liked: false } : p));
      } else {
        await supabase.from('likes').insert({ post_id: post.id, user_id: currentUser.id });
        setLikedPostIds((prev) => new Set([...prev, post.id]));
        setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, like_count: p.like_count + 1, _liked: true } : p));
      }
    } catch { showToast('操作失败', 'error'); }
  };

  return (
    <div className="pb-4">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/category')} className="p-1 -ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">{cat.label}</h1>
      </div>

      <div className="px-4 pt-3 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>该分类下暂无帖子</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} onLike={handleLike} />)
        )}
      </div>
    </div>
  );
}

// Search results page - same structure as category posts
export function SearchPage() {
  const navigate = useNavigate();
  const { currentUser, showToast } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPostIds, setLikedPostIds] = useState(new Set());
  const query = new URLSearchParams(window.location.search).get('q') || '';

  const fetchPosts = useCallback(async () => {
    if (!query) return;
    setLoading(true);
    try {
      const { data } = await supabase.from('posts').select('*').ilike('content', `%${query}%`).order('created_at', { ascending: false });
      const list = data || [];
      if (currentUser) {
        const { data: likes } = await supabase.from('likes').select('post_id').eq('user_id', currentUser.id);
        const ids = new Set((likes || []).map((l) => l.post_id));
        setLikedPostIds(ids);
        list.forEach((p) => { p._liked = ids.has(p.id); });
      }
      setPosts(list);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [query, currentUser]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleLike = async (post) => {
    if (!currentUser) { showToast('请先登录', 'error'); return; }
    const liked = likedPostIds.has(post.id);
    try {
      if (liked) {
        await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', currentUser.id);
        setLikedPostIds((prev) => { const n = new Set(prev); n.delete(post.id); return n; });
        setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, like_count: Math.max(p.like_count - 1, 0), _liked: false } : p));
      } else {
        await supabase.from('likes').insert({ post_id: post.id, user_id: currentUser.id });
        setLikedPostIds((prev) => new Set([...prev, post.id]));
        setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, like_count: p.like_count + 1, _liked: true } : p));
      }
    } catch { showToast('操作失败', 'error'); }
  };

  return (
    <div className="pb-4">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">搜索: {query}</h1>
      </div>

      <div className="px-4 pt-3 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400"><p>未找到相关帖子</p></div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} onLike={handleLike} />)
        )}
      </div>
    </div>
  );
}
