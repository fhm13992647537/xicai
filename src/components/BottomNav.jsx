import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { key: "posts", path: "/", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zm0 4a1 1 0 011-1h10a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM18 7a1 1 0 00-1 1v.01a1 1 0 001 1V8zm0 4a1 1 0 00-1 1v.01a1 1 0 001 1V11zm0 4a1 1 0 00-1 1v.01a1 1 0 001 1V15z", label: "帖子" },
  { key: "category", path: "/category", icon: "M4 6h16M4 12h16M4 18h7", label: "分类" },
  { key: "chat", path: "/chat", icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z", label: "聊天", auth: true },
  { key: "profile", path: "/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label: "我的", auth: true },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const isLoggedIn = !!currentUser;

  const visibleTabs = tabs.filter((t) => !t.auth || isLoggedIn);

  return React.createElement(
    "nav",
    {
      className:
        "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-40",
    },
    React.createElement(
      "div",
      { className: "flex justify-around items-center h-14 max-w-lg mx-auto" },
      visibleTabs.map((tab) => {
        const isActive = tab.path === "/" 
          ? location.pathname === "/" 
          : location.pathname.startsWith(tab.path);
        return React.createElement(
          "button",
          {
            key: tab.key,
            onClick: () => navigate(tab.path),
            className:
              "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors " +
              (isActive ? "text-primary-600" : "text-gray-400"),
          },
          React.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-6 w-6",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              strokeWidth: isActive ? 2 : 1.5,
            },
            React.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              d: tab.icon,
            })
          ),
          React.createElement(
            "span",
            { className: "text-[10px] font-medium" },
            tab.label
          )
        );
      })
    )
  );
}
