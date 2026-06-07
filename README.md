# 校园圈 (Campus Circle)

校园社交 Web 应用，基于 React + Tailwind CSS + Supabase 构建。

## 技术栈

- **前端**：React 18 + Vite + Tailwind CSS
- **路由**：React Router v6
- **后端服务**：Supabase（数据库 + 认证 + 存储 + 实时）
- **部署**：Vercel（免费）

## 功能特性

### 用户系统
- 注册/登录（账号 + @campus.local 虚拟邮箱）
- 账号规则：纯数字、字母或组合，不可包含特殊符号，不可重复
- 权限分级：未登录可见帖子/分类，登录后解锁全部功能
- 多设备数据同步

### 帖子
- 按时间倒序的信息流
- 五大分类：失物招领、旧货售卖、校园活动、求助打听、其他
- 点赞/取消点赞（仅登录用户）
- 两级嵌套评论（回复回复人）

### 聊天
- 好友请求/同意/拒绝
- 单方面删除好友（清空聊天记录）
- Supabase Realtime 实时消息推送

### 管理员
- 预设账号：`admin` / 密码 `Admin123456`
- 管理员可删除任意帖子（级联删除评论和点赞）
- 通过"我的"页面底部入口登录

## 项目结构

```
campus-circle/
├── database/
│   └── migration.sql          # 数据库迁移文件（建表 + RLS + 触发器）
├── public/
│   └── favicon.svg
├── src/
│   ├── config/
│   │   └── supabase.js        # Supabase 客户端配置
│   ├── context/
│   │   └── AuthContext.jsx     # 全局认证状态管理
│   ├── components/
│   │   ├── BottomNav.jsx       # 底部导航栏
│   │   ├── Toast.jsx           # Toast 提示
│   │   ├── PostCard.jsx        # 帖子卡片
│   │   ├── CommentItem.jsx     # 评论项
│   │   ├── PublishPost.jsx     # 发布帖子弹窗
│   │   ├── AdminLogin.jsx      # 管理员登录弹窗
│   │   └── FriendRequestList.jsx
│   ├── pages/
│   │   ├── AuthPage.jsx        # 登录/注册页
│   │   ├── PostsPage.jsx       # 帖子首页
│   │   ├── PostDetailPage.jsx  # 帖子详情 + 评论
│   │   ├── CategoryPage.jsx    # 分类列表
│   │   ├── CategoryPostsPage.jsx # 分类帖子 + 搜索
│   │   ├── ChatPage.jsx        # 好友列表 + 好友请求
│   │   ├── ChatRoomPage.jsx    # 聊天界面
│   │   └── ProfilePage.jsx     # 个人中心
│   ├── utils/
│   │   └── helpers.js          # 工具函数
│   ├── App.jsx                 # 路由配置
│   ├── main.jsx                # 入口
│   └── index.css               # 全局样式
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 快速开始

### 1. 注册 Supabase

1. 访问 [supabase.com](https://supabase.com) 注册账号
2. 创建一个新项目（选择离你最近的区域）
3. 等待数据库初始化完成（约 2 分钟）

### 2. 配置数据库

1. 在 Supabase Dashboard 左侧菜单进入 **SQL Editor**
2. 点击 **New query**
3. 复制 `database/migration.sql` 的全部内容粘贴进去
4. 点击 **Run** 执行
5. 确认所有表和策略创建成功

### 3. 创建存储桶

1. 左侧菜单进入 **Storage**
2. 点击 **New bucket**
3. 名称填 `avatars`，勾选 **Public bucket**
4. 创建后在 **SQL Editor** 执行（migration.sql 末尾注释区的存储策略 SQL）：
```sql
create policy "avatars_select_all" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_insert_own" on storage.objects for insert with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "avatars_update_own" on storage.objects for update using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "avatars_delete_own" on storage.objects for delete using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4. 创建管理员账号

1. 左侧菜单进入 **Authentication** > **Users**
2. 点击 **Add user** > **Create new user**
3. 填写：
   - Email: `admin@campus.local`
   - Password: `Admin123456`
   - 勾选 **Auto Confirm User**
4. 创建后，在 **SQL Editor** 执行：
```sql
update public.profiles set role = 'admin' where username = 'admin';
```

### 5. 获取 API 密钥

1. 左侧菜单进入 **Project Settings** > **API**
2. 复制以下信息：
   - **Project URL**（例如 `https://xxxxx.supabase.co`）
   - **anon public key**

### 6. 配置环境变量

在项目根目录创建 `.env` 文件：

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 7. 安装依赖并运行

```bash
npm install
npm run dev
```

访问 `http://localhost:5173` 即可使用。

## 部署到 Vercel

### 方法一：Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

在 Vercel 项目设置中添加环境变量：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 方法二：Vercel Dashboard

1. 将项目推送到 GitHub
2. 在 [vercel.com](https://vercel.com) 导入 GitHub 仓库
3. 配置环境变量（同上）
4. 点击 Deploy

## 数据模型

| 表名 | 说明 |
|------|------|
| `profiles` | 用户资料（关联 auth.users） |
| `posts` | 帖子 |
| `likes` | 点赞（复合主键 post_id + user_id） |
| `comments` | 评论（parent_id 支持嵌套回复） |
| `friend_requests` | 好友请求 |
| `friendships` | 好友关系（双向存储） |
| `chats` | 聊天会话 |
| `chat_members` | 聊天成员 |
| `messages` | 聊天消息 |

所有表均启用 Row Level Security (RLS)，确保数据安全隔离。

## 许可证

MIT
