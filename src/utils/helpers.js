// 校园圈 - 工具函数

/** 格式化时间为相对时间 */
export function formatTime(date) {
  if (!date) return "";
  const now = new Date();
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return "刚刚";
  if (diff < 3600) return Math.floor(diff / 60) + "分钟前";
  if (diff < 86400) return Math.floor(diff / 3600) + "小时前";
  if (diff < 2592000) return Math.floor(diff / 86400) + "天前";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

/** 分类标签映射 */
export const CATEGORIES = [
  { key: "lost_found", label: "失物招领", color: "bg-amber-100 text-amber-700" },
  { key: "second_hand", label: "旧货售卖", color: "bg-green-100 text-green-700" },
  { key: "activity", label: "校园活动", color: "bg-blue-100 text-blue-700" },
  { key: "help", label: "求助打听", color: "bg-purple-100 text-purple-700" },
  { key: "other", label: "其他", color: "bg-gray-100 text-gray-600" },
];

export function getCategoryInfo(key) {
  return CATEGORIES.find((c) => c.key === key) || CATEGORIES[4];
}

/** 生成唯一ID */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/** LeanCloud 错误信息中文映射 */
export function getErrorMessage(error) {
  const map = {
    202: "该账号已被注册，请更换",
    210: "账号或密码错误",
    211: "账号或密码错误",
    219: "登录失败次数过多，请稍后再试",
    1001: "网络连接失败，请检查网络",
  };
  return map[error?.code] || error?.message || error?.error || "操作失败，请稍后重试";
}
