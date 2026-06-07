import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatTime, getCategoryInfo } from "../utils/helpers";

export default function PostCard({ post, onLike, onDelete }) {
  const navigate = useNavigate();
  const { currentUser, isAdmin, showToast } = useAuth();
  const cat = getCategoryInfo(post.category);

  const handleLike = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast("请先登录", "error");
      return;
    }
    onLike?.(post);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("确定要删除这条帖子吗？相关评论和点赞也会被删除。")) {
      onDelete?.(post);
    }
  };

  const isLiked = post._liked || false;

  // 创建者首字母头像
  const avatarLetter = (post.authorName || "匿")[0];

  return React.createElement(
    "div",
    {
      onClick: () => navigate("/post/" + post.id),
      className: "card p-4 cursor-pointer active:bg-gray-50 transition-colors",
    },
    // 头部：作者信息
    React.createElement(
      "div",
      { className: "flex items-center gap-3 mb-3" },
      React.createElement(
        "div",
        {
          className:
            "w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 " +
            (post.authorAvatar
              ? "bg-cover bg-center"
              : "bg-primary-500"),
          style: post.authorAvatar
            ? { backgroundImage: "url(" + post.authorAvatar + ")" }
            : {},
        },
        post.authorAvatar ? null : avatarLetter
      ),
      React.createElement(
        "div",
        { className: "flex-1 min-w-0" },
        React.createElement(
          "div",
          { className: "font-medium text-sm text-gray-900 truncate" },
          post.authorName || "匿名用户"
        ),
        React.createElement(
          "div",
          { className: "text-xs text-gray-400" },
          formatTime(post.createdAt)
        )
      ),
      // 管理员删除按钮
      isAdmin &&
        React.createElement(
          "button",
          {
            onClick: handleDelete,
            className: "text-red-500 text-xs px-2 py-1 rounded hover:bg-red-50 active:bg-red-100 flex-shrink-0",
          },
          "删除"
        )
    ),
    // 正文
    post.content &&
      React.createElement(
        "p",
        { className: "text-sm text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap line-clamp-4" },
        post.content
      ),
    // 底部：分类标签 + 互动数据
    React.createElement(
      "div",
      { className: "flex items-center justify-between" },
      React.createElement(
        "span",
        {
          className:
            "inline-block px-2 py-0.5 rounded-full text-xs font-medium " +
            cat.color,
        },
        cat.label
      ),
      React.createElement(
        "div",
        { className: "flex items-center gap-4 text-gray-400 text-xs" },
        // 点赞
        React.createElement(
          "button",
          {
            onClick: handleLike,
            className:
              "flex items-center gap-1 transition-colors " +
              (isLiked ? "text-red-500" : "hover:text-red-400"),
          },
          React.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-4 w-4",
              fill: isLiked ? "currentColor" : "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              strokeWidth: 2,
            },
            React.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              d: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
            })
          ),
          post.like_count || 0
        ),
        // 评论
        React.createElement(
          "span",
          { className: "flex items-center gap-1" },
          React.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-4 w-4",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              strokeWidth: 2,
            },
            React.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              d: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z",
            })
          ),
          post.comment_count || 0
        )
      )
    )
  );
}
