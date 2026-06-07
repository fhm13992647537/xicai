import React from "react";
import { formatTime } from "../utils/helpers";

export default function CommentItem({ comment, onReply, depth = 0 }) {
  const avatarLetter = (comment.authorName || "匿")[0];
  const maxDepth = 1; // 只允许两级嵌套

  return React.createElement(
    "div",
    {
      className: "flex gap-2.5 " + (depth > 0 ? "ml-8 mt-2" : "py-3 border-b border-gray-50 last:border-0"),
    },
    React.createElement(
      "div",
      {
        className:
          "w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 " +
          (comment.authorAvatar ? "bg-cover bg-center" : "bg-primary-400"),
        style: comment.authorAvatar
          ? { backgroundImage: "url(" + comment.authorAvatar + ")" }
          : {},
      },
      comment.authorAvatar ? null : avatarLetter
    ),
    React.createElement(
      "div",
      { className: "flex-1 min-w-0" },
      React.createElement(
        "div",
        { className: "flex items-center gap-2 mb-0.5" },
        React.createElement(
          "span",
          { className: "text-sm font-medium text-gray-900" },
          comment.authorName || "匿名用户"
        ),
        React.createElement(
          "span",
          { className: "text-xs text-gray-400" },
          formatTime(comment.createdAt)
        )
      ),
      React.createElement(
        "p",
        { className: "text-sm text-gray-700 leading-relaxed" },
        comment.content
      ),
      depth < maxDepth &&
        React.createElement(
          "button",
          {
            onClick: () => onReply?.(comment),
            className: "text-xs text-primary-500 mt-1 hover:text-primary-600",
          },
          "回复"
        )
    )
  );
}
