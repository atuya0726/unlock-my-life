-- --------------------------------------------------------
-- 1. Profiles (本体)
-- ここには本名(real_name)などの機密情報が含まれる。
-- RLSを「本人限定」に設定し、直接アクセスを完全に遮断する。
-- --------------------------------------------------------

create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  
  -- 公開してもいい情報
  display_name text,
  avatar_url text,
  
  -- 隠したい情報
  real_name text, 
  is_premium boolean default false,
  is_public boolean default false not null, -- 公開スイッチ
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS設定
alter table public.profiles enable row level security;

-- 【鉄壁ポリシー】
-- SELECT, INSERT, UPDATE すべて "auth.uid() = id" (本人) のみ許可。
-- これにより、APIから "supabase.from('profiles').select('*')" としても
-- 他人のデータは1ミリも見えなくなる。
create policy "Profiles are strictly private (owner only)"
  on public.profiles
  using ( auth.uid() = id );  -- 閲覧・更新・追加すべてに適用


-- --------------------------------------------------------
-- 2. Public Profiles View (公開用窓口)
-- 「名前とアイコンだけ」を安全に露出させるためのビュー。
-- "security_invoker = false" (デフォルト) により、
-- 実行ユーザーの権限ではなく「ビュー作成者(管理者)」の権限で動くため、
-- 上記の厳格なRLSをバイパスしてデータを取得できる。
-- --------------------------------------------------------

create view public.profiles_view as
  select
    id,
    display_name,
    avatar_url,
    is_public
  from public.profiles
  where is_public = true; -- ここで「公開設定の人だけ」に絞る

-- ビューへのアクセス権を付与
grant select on public.profiles_view to anon, authenticated;