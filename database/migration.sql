-- ============================================================
-- 校园圈 (Campus Circle) - Supabase 数据库迁移文件
-- 在 Supabase SQL Editor 中完整执行此文件
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  name text not null,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. posts
-- ============================================================
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.profiles on delete cascade,
  author_name text not null,
  author_avatar text,
  content text not null,
  category text not null check (category in ('lost_found','second_hand','activity','help','other')),
  like_count int not null default 0,
  comment_count int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_posts_created_at on public.posts (created_at desc);
create index idx_posts_category on public.posts (category);

-- ============================================================
-- 3. likes
-- ============================================================
create table public.likes (
  post_id uuid not null references public.posts on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ============================================================
-- 4. comments
-- ============================================================
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts on delete cascade,
  author_id uuid not null references public.profiles on delete cascade,
  author_name text not null,
  author_avatar text,
  content text not null,
  parent_id uuid references public.comments on delete cascade,
  created_at timestamptz not null default now()
);
create index idx_comments_post on public.comments (post_id, created_at);

-- ============================================================
-- 5. friend_requests
-- ============================================================
create table public.friend_requests (
  id uuid primary key default uuid_generate_v4(),
  from_user uuid not null references public.profiles on delete cascade,
  to_user uuid not null references public.profiles on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now(),
  unique (from_user, to_user)
);
create index idx_fr_to on public.friend_requests (to_user, status);

-- ============================================================
-- 6. friendships
-- ============================================================
create table public.friendships (
  user_id uuid not null references public.profiles on delete cascade,
  friend_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);

-- ============================================================
-- 7. chats
-- ============================================================
create table public.chats (
  id uuid primary key default uuid_generate_v4(),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 8. chat_members
-- ============================================================
create table public.chat_members (
  chat_id uuid not null references public.chats on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  primary key (chat_id, user_id)
);

-- ============================================================
-- 9. messages
-- ============================================================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid not null references public.chats on delete cascade,
  sender_id uuid not null references public.profiles on delete cascade,
  sender_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);
create index idx_messages_chat on public.messages (chat_id, created_at);

-- ============================================================
-- RLS: 启用所有表的行级安全
-- ============================================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.chats enable row level security;
alter table public.chat_members enable row level security;
alter table public.messages enable row level security;

-- profiles: 所有人可读，只能改自己的
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- posts: 所有人可读，登录可发，作者和管理员可删
create policy "posts_select_all" on public.posts for select using (true);
create policy "posts_insert_auth" on public.posts for insert with check (auth.uid() = author_id);
create policy "posts_delete_auth" on public.posts for delete using (
  auth.uid() = author_id
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "posts_update_author" on public.posts for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

-- likes: 所有人可读，只能操作自己的
create policy "likes_select_all" on public.likes for select using (true);
create policy "likes_insert_own" on public.likes for insert with check (auth.uid() = user_id);
create policy "likes_delete_own" on public.likes for delete using (auth.uid() = user_id);

-- comments: 所有人可读，登录可发，只能删自己的
create policy "comments_select_all" on public.comments for select using (true);
create policy "comments_insert_auth" on public.comments for insert with check (auth.uid() = author_id);
create policy "comments_delete_own" on public.comments for delete using (auth.uid() = author_id);

-- friend_requests: 收发双方可见
create policy "fr_select_involved" on public.friend_requests for select using (auth.uid() = from_user or auth.uid() = to_user);
create policy "fr_insert_from" on public.friend_requests for insert with check (auth.uid() = from_user);
create policy "fr_update_to" on public.friend_requests for update using (auth.uid() = to_user) with check (auth.uid() = to_user);
create policy "fr_delete_from" on public.friend_requests for delete using (auth.uid() = from_user and status = 'pending');

-- friendships: 只看到自己的
create policy "fs_select_own" on public.friendships for select using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "fs_insert_own" on public.friendships for insert with check (auth.uid() = user_id);
create policy "fs_delete_own" on public.friendships for delete using (auth.uid() = user_id);

-- chats: 仅成员可读
create policy "chats_select_member" on public.chats for select using (
  exists (select 1 from public.chat_members where chat_id = id and user_id = auth.uid())
);
create policy "chats_insert_auth" on public.chats for insert with check (auth.uid() is not null);

-- chat_members
create policy "cm_select_own" on public.chat_members for select using (
  exists (select 1 from public.chat_members cm where cm.chat_id = chat_id and cm.user_id = auth.uid())
);
create policy "cm_insert_auth" on public.chat_members for insert with check (auth.uid() is not null);

-- messages: 成员可见
create policy "msg_select_member" on public.messages for select using (
  exists (select 1 from public.chat_members where chat_id = messages.chat_id and user_id = auth.uid())
);
create policy "msg_insert_member" on public.messages for insert with check (
  auth.uid() = sender_id
  and exists (select 1 from public.chat_members where chat_id = messages.chat_id and user_id = auth.uid())
);

-- ============================================================
-- 触发器: 注册时自动创建 profile
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, name, role)
  values (
    new.id,
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 触发器: 自动更新帖子的 like_count 和 comment_count
-- ============================================================
create or replace function public.update_post_stats()
returns trigger as $$
begin
  if tg_table_name = 'comments' then
    if tg_op = 'INSERT' then
      update public.posts set comment_count = comment_count + 1 where id = new.post_id;
    elsif tg_op = 'DELETE' then
      update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
    end if;
  end if;
  if tg_table_name = 'likes' then
    if tg_op = 'INSERT' then
      update public.posts set like_count = like_count + 1 where id = new.post_id;
    elsif tg_op = 'DELETE' then
      update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
    end if;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_comment_count on public.comments;
create trigger trg_comment_count after insert or delete on public.comments
  for each row execute function public.update_post_stats();

drop trigger if exists trg_like_count on public.likes;
create trigger trg_like_count after insert or delete on public.likes
  for each row execute function public.update_post_stats();

-- ============================================================
-- Realtime: 开启实时消息监听
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.chats;
alter publication supabase_realtime add table public.chat_members;

-- ============================================================
-- 存储桶策略 (手动创建 avatars bucket 后执行)
-- ============================================================
/*
-- 在 Supabase Dashboard > Storage 新建 public bucket "avatars"
-- 然后在 SQL Editor 执行:

create policy "avatars_select_all" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_delete_own" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
*/

-- ============================================================
-- 管理员初始化 (在 Supabase Auth Dashboard 手动创建后执行)
-- ============================================================
-- 1. Authentication > Users > Add User
--    Email: admin@campus.local
--    Password: Admin123456
--    勾选 "Auto Confirm User"
-- 2. 创建后在 SQL Editor 执行:
--    update public.profiles set role = 'admin' where username = 'admin';
-- ============================================================
