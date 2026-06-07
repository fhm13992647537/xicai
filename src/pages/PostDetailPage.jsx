import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import CommentItem from '../components/CommentItem';
import { formatTime, getCategoryInfo } from '../utils/helpers';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, profile, showToast } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null); // 回复目标评论
  const [liked, setLiked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = useCallback(async () => {
    const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
    if (error || !data) { navigate('/'); return; }
    setPost(data);
    if (currentUser) {
      const { data: l } = await supabase.from('likes').select('*').eq('post_id', id).eq('user_id', currentUser.id).maybeSingle();
      setLiked(!!l);
    }
    setLoading(false);
  }, [id, currentUser, navigate]);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase.from('comments').select('*').eq('post_id', id).order('created_at', { ascending: true });
    setComments(data || []);
  }, [id]);

  useEffect(() => { fetchPost(); fetchComments(); }, [fetchPost, fetchComments]);

  const handleLike = async () => {
    if (!currentUser) { showToast('请先登录', 'error'); return; }
    try {
      if (liked) {
        await supabase.from('likes').delete().eq('post_id', id).eq('user_id', currentUser.id);
        setLiked(false);
        setPost((p) => p && { ...p, like_count: Math.max(p.like_count - 1, 0) });
      } else {
        await supabase.from('likes').insert({ post_id: id, user_id: currentUser.id });
        setLiked(true);
        setPost((p) => p && { ...p, like_count: p.like_count + 1 });
      }
    } catch { showToast('操作失败', 'error'); }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!currentUser) { showToast('请先登录', 'error'); return; }
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('comments').insert({
        post_id: id,
        author_id: currentUser.id,
        author_name: profile?.name || currentUser.email?.split('@')[0] || '用户',
        author_avatar: profile?.avatar_url || '',
        content: commentText.trim(),
        parent_id: replyTo?.id || null,
      });
      if (error) throw error;
      setCommentText('');
      setReplyTo(null);
      showToast('评论成功', 'success');
      fetchComments();
    } catch { showToast('评论失败', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleAddFriend = async () => {
    if (!currentUser) { showToast('请先登录', 'error'); return; }
    if (!post || post.author_id === currentUser.id) { showToast('不能添加自己为好友', 'error'); return; }
    try {
      const { data: existing } = await supabase.from('friend_requests')
        .select('*').eq('from_user', currentUser.id).eq('to_user', post.author_id).maybeSingle();
      if (existing) { showToast('已发送过好友请求', 'info'); return; }
      const { data: friendship } = await supabase.from('friendships')
        .select('*').eq('user_id', currentUser.id).eq('friend_id', post.author_id).maybeSingle();
      if (friendship) { showToast('你们已经是好友了', 'info'); return; }
      await supabase.from('friend_requests').insert({ from_user: currentUser.id, to_user: post.author_id });
      showToast('好友请求已发送', 'success');
    } catch { showToast('操作失败', 'error'); }
  };

  if (loading || !post) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" /></div>;
  }

  const cat = getCategoryInfo(post.category);
  const avatarLetter = (post.author_name || '匿')[0];
  const topComments = comments.filter((c) => !c.parent_id);
  const replies = (cid) => comments.filter((c) => c.parent_id === cid);

  return (
    <div className="pb-6">
      {/* 顶栏 */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">帖子详情</h1>
      </div>

      {/* 帖子内容 */}
      <div className="px-4 pt-4">
        <div className="card p-4">
          {/* 作者 */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={post.author_avatar ? { backgroundImage: `url(${post.author_avatar})`, backgroundSize: 'cover' } : {}}>
              {!post.author_avatar && avatarLetter}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900">{post.author_name}</div>
              <div className="text-xs text-gray-400">{formatTime(post.created_at)}</div>
            </div>
            {/* 加好友按钮 */}
            {currentUser && post.author_id !== currentUser.id && (
              <button onClick={handleAddFriend} className="btn-outline text-xs py-1.5 px-3 border-gray-300 text-gray-600">
                加好友
              </button>
            )}
          </div>
          {/* 正文 */}
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          {/* 分类标签 */}
          <span className={`inline-block mt-3 px-2 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>{cat.label}</span>
          {/* 互动栏 */}
          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-50 text-gray-400 text-sm">
            <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-500' : 'hover:text-red-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              {post.like_count || 0}
            </button>
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
              {comments.length}
            </span>
          </div>
        </div>
      </div>

      {/* 评论区 */}
      <div className="px-4 mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">评论 ({comments.length})</h3>
        {topComments.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">暂无评论，来发表第一条吧</p>
        ) : (
          <div className="space-y-1">
            {topComments.map((c) => (
              <div key={c.id}>
                <CommentItem comment={c} onReply={setReplyTo} />
                {replies(c.id).map((r) => (
                  <CommentItem key={r.id} comment={r} depth={1} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 发布评论 */}
      {currentUser && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 safe-bottom z-50">
          {replyTo && (
            <div className="flex items-center justify-between text-xs text-primary-600 mb-2 px-1">
              <span>回复 {replyTo.author_name}：</span>
              <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">取消</button>
            </div>
          )}
          <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 input-field text-sm py-2"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyTo ? `回复 ${replyTo.author_name}...` : '写下你的评论...'}
              disabled={submitting}
            />
            <button type="submit" className="btn-primary text-sm py-2 px-4" disabled={submitting || !commentText.trim()}>
              {submitting ? '发送中' : '发送'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
