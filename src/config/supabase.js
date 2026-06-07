// 校园圈 - Supabase 客户端配置
// 请在 Supabase 控制台获取以下信息并替换
// 注册地址: https://supabase.com

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase 未配置，请设置环境变量: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
