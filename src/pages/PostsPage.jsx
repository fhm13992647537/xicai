import React, { useState, useEffect, useCallback } from 'react';
import supabase from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import PublishPost from '../components/PublishPost';
import { CATEGORIES } from '../utils/helpers';

export default function PostsPage() {
  const { currentUser, profile, isAdmin, showToast } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [likedPostIds, setLikedPostIds] = useState(new Set());

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const list = data || [];

      // 如果已登录，查询用户点赞了哪些帖子
      if (currentUser) {
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', currentUser.id);
        const ids = new Set((likes || []).map((l) => l.post_id));
        setLikedPostIds(ids);
        // 注入 _liked 标记
        list.forEach((p) => { p._liked = ids.has(p.id); });
      }

      setPosts(list);
    } catch (err) {
      console.error('fetchPosts error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

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
    } catch (err) {
      showToast('操作失败', 'error');
    }
  };

  const handleDelete = async (post) => {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', post.id);
      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      showToast('帖子已删除', 'success');
    } catch (err) {
      showToast('删除失败', 'error');
    }
  };

  return (
    <div className="pb-4">
      {/* 顶栏 */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">校园圈</h1>
      </div>

      {/* 帖子列表 */}
      <div className="px-4 pt-3 space-y-3">
        {loading && posts.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6" />
            </svg>
            <p>暂无帖子，来发布第一条吧</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} onDelete={handleDelete} />
          ))
        )}
      </div>

      {/* 发布按钮 */}
      {currentUser && (
        <button
          onClick={() => setShowPublish(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-300 flex items-center justify-center hover:bg-primary-700 active:bg-primary-800 transition-colors z-30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {showPublish && (
        <PublishPost onClose={() => setShowPublish(false)} onPublished={fetchPosts} />
      )}
    </div>
  );
}
