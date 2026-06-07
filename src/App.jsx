import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import AuthPage from './pages/AuthPage';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import CategoryPage from './pages/CategoryPage';
import CategoryPostsPage, { SearchPage } from './pages/CategoryPostsPage';
import ChatPage from './pages/ChatPage';
import ChatRoomPage from './pages/ChatRoomPage';
import ProfilePage from './pages/ProfilePage';

function AppLayout() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // Not logged in: show auth page only
  if (!currentUser && location.pathname !== '/auth') {
    return <Navigate to="/auth" replace />;
  }

  // On auth page while logged in: redirect to home
  if (currentUser && location.pathname === '/auth') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50 relative">
      <div className="pb-16">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<PostsPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/category/:key" element={<CategoryPostsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:friendId" element={<ChatRoomPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}