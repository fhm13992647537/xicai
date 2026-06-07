import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/helpers';
import supabase from '../config/supabase';

export default function PublishPost({ onClose, onPublished }) {
  const { currentUser, profile, showToast } = useAuth();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('other');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { showToast('请输入帖子内容', 'error'); return; }
    if (!currentUser) { showToast('请先登录', 'error'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from('posts').insert({
        author_id: currentUser.id,
        author_name: profile?.name || profile?.username || '用户',
        author_avatar: profile?.avatar_url || '',
        content: content.trim(),
        category,
      });
      if (error) throw error;
      showToast('发布成功！', 'success');
      onPublished?.();
      onClose();
    } catch { showToast('发布失败，请稍后重试', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">发布帖子</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择分类</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === cat.key ? cat.color + ' ring-2 ring-offset-1 ring-primary-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">帖子内容</label>
            <textarea
              className="input-field min-h-[120px] resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享你的校园生活..."
              maxLength={5000}
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{content.length}/5000</p>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading || !content.trim()}>
            {loading ? '发布中...' : '发布'}
          </button>
        </form>
      </div>
    </div>
  );
}
