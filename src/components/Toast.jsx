import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Toast() {
  const { toasts } = useAuth();

  if (toasts.length === 0) return null;

  return React.createElement(
    "div",
    { className: "fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-sm" },
    toasts.map((t) =>
      React.createElement(
        "div",
        {
          key: t.id,
          className:
            "toast-enter px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium text-center " +
            (t.type === "error"
              ? "bg-red-500"
              : t.type === "success"
              ? "bg-green-500"
              : "bg-gray-800"),
        },
        t.message
      )
    )
  );
}
