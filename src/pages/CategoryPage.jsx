import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../utils/helpers';

export default function CategoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="pb-4">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900 mb-3">分类</h1>
        <form onSubmit={handleSearch} className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索帖子..."
            className="input-field pl-10 text-sm py-2"
          />
        </form>
      </div>

      <div className="px-4 pt-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">全部分类</h2>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => navigate(`/category/${cat.key}`)}
              className={`card p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cat.color.replace('text-', 'bg-').replace('700', '100').replace('600', '100')}`}>
                <span className="text-xl">{cat.key === 'lost_found' ? '📦' : cat.key === 'second_hand' ? '💰' : cat.key === 'activity' ? '🎉' : cat.key === 'help' ? '❓' : '📝'}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
