-- ╔══════════════════════════════════════════════════════════════╗
-- ║  LUMINA — Veritabanı Şeması (PostgreSQL / Supabase)            ║
-- ║  Supabase SQL Editor'a yapıştırıp çalıştırın.                  ║
-- ║  Idempotent: tekrar çalıştırmak güvenlidir.                   ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ──────────────────────────────────────────────────────────────
-- 0. Uzantılar
-- ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────────
-- 1. PROFILES — auth.users ile 1:1
-- ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- 2. CREDITS — kullanıcı başına tek satır bakiye
-- ──────────────────────────────────────────────────────────────
create table if not exists public.credits (
  user_id       uuid primary key references public.profiles (id) on delete cascade,
  balance       integer not null default 0 check (balance >= 0),
  total_earned  integer not null default 0,
  total_spent   integer not null default 0,
  updated_at    timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- 3. CREDIT_TRANSACTIONS — değişmez defter (audit log)
-- ──────────────────────────────────────────────────────────────
create table if not exists public.credit_transactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  amount         integer not null,          -- + yükleme, − harcama
  reason         text not null,
  generation_id  uuid,
  created_at     timestamptz not null default now()
);
create index if not exists credit_tx_user_idx
  on public.credit_transactions (user_id, created_at desc);

-- ──────────────────────────────────────────────────────────────
-- 4. GENERATIONS — üretim geçmişi
-- ──────────────────────────────────────────────────────────────
create table if not exists public.generations (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade,
  status             text not null default 'pending'
                       check (status in ('pending','processing','completed','failed')),
  source_image_path  text,
  source_image_url   text,
  category           text,
  concept_title      text,
  prompt             text,
  template_id        text,
  result_image_path  text,
  result_image_url   text,
  model              text,
  credits_spent      integer not null default 1,
  error              text,
  created_at         timestamptz not null default now(),
  completed_at       timestamptz
);
create index if not exists generations_user_idx
  on public.generations (user_id, created_at desc);

-- Satış Seti (C10): tek üründen üretilen 4 karelik seti gruplayan kimlik.
-- Var olan kurulumlarda idempotent ekleme — canlı DB'de zaten mevcut.
alter table public.generations add column if not exists set_id uuid;
create index if not exists generations_set_idx
  on public.generations (set_id) where set_id is not null;

-- ──────────────────────────────────────────────────────────────
-- 5. PACKAGES — satın alınabilir kredi paketleri
-- ──────────────────────────────────────────────────────────────
create table if not exists public.packages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  credits      integer not null check (credits > 0),
  price_cents  integer not null check (price_cents >= 0),
  currency     text not null default 'TRY',
  is_active    boolean not null default true,
  is_popular   boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- 6. PURCHASES — ödeme kayıtları (Stripe/Iyzico için mock)
-- ──────────────────────────────────────────────────────────────
create table if not exists public.purchases (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  package_id    uuid references public.packages (id) on delete set null,
  credits       integer not null,
  amount_cents  integer not null,
  currency      text not null default 'TRY',
  status        text not null default 'pending'
                  check (status in ('pending','paid','failed','refunded')),
  provider      text,        -- 'mock' | 'stripe' | 'iyzico'
  provider_ref  text,
  created_at    timestamptz not null default now()
);
create index if not exists purchases_user_idx
  on public.purchases (user_id, created_at desc);

-- ══════════════════════════════════════════════════════════════
-- 7. TETİKLEYİCİLER (TRIGGERS)
-- ══════════════════════════════════════════════════════════════

-- updated_at otomatik güncelleme
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_credits_touch on public.credits;
create trigger trg_credits_touch
  before update on public.credits
  for each row execute function public.touch_updated_at();

-- ── Yeni kullanıcı → profil + 3 ÜCRETSİZ KREDİ ──
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  free_credits integer := 3;  -- yeni kayıt ücretsiz hakkı
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.credits (user_id, balance, total_earned)
  values (new.id, free_credits, free_credits)
  on conflict (user_id) do nothing;

  insert into public.credit_transactions (user_id, amount, reason)
  values (new.id, free_credits, 'signup_bonus');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ══════════════════════════════════════════════════════════════
-- 8. KREDİ İŞLEM FONKSİYONLARI (atomik, RPC ile çağrılır)
-- ══════════════════════════════════════════════════════════════

-- Kredi düş — bakiye yetersizse hata fırlatır (atomik).
create or replace function public.spend_credits(
  p_user_id       uuid,
  p_amount        integer,
  p_reason        text,
  p_generation_id uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance integer;
begin
  if p_amount <= 0 then
    raise exception 'Harcama tutarı pozitif olmalı';
  end if;

  update public.credits
     set balance      = balance - p_amount,
         total_spent  = total_spent + p_amount
   where user_id = p_user_id
     and balance >= p_amount
  returning balance into new_balance;

  if new_balance is null then
    raise exception 'Yetersiz kredi' using errcode = 'P0001';
  end if;

  insert into public.credit_transactions (user_id, amount, reason, generation_id)
  values (p_user_id, -p_amount, p_reason, p_generation_id);

  return new_balance;
end;
$$;

-- Kredi yükle (satın alma / iade / bonus).
create or replace function public.grant_credits(
  p_user_id uuid,
  p_amount  integer,
  p_reason  text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance integer;
begin
  if p_amount <= 0 then
    raise exception 'Yükleme tutarı pozitif olmalı';
  end if;

  insert into public.credits (user_id, balance, total_earned)
  values (p_user_id, p_amount, p_amount)
  on conflict (user_id) do update
    set balance      = public.credits.balance + p_amount,
        total_earned = public.credits.total_earned + p_amount
  returning balance into new_balance;

  insert into public.credit_transactions (user_id, amount, reason)
  values (p_user_id, p_amount, p_reason);

  return new_balance;
end;
$$;

-- ══════════════════════════════════════════════════════════════
-- 9. ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════
alter table public.profiles            enable row level security;
alter table public.credits             enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.generations         enable row level security;
alter table public.packages            enable row level security;
alter table public.purchases           enable row level security;

-- Rol izinleri: RLS satır erişimini denetler, ancak roller önce tablo
-- düzeyinde GRANT almalı. (Supabase bulutta varsayılan; yerelde gerekli.)
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public
  to anon, authenticated, service_role;
grant all on all sequences in schema public
  to anon, authenticated, service_role;
grant execute on all functions in schema public
  to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to anon, authenticated, service_role;

-- PROFILES: kullanıcı yalnızca kendi profilini görür/günceller
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- CREDITS: yalnızca okuma (yazma sadece SECURITY DEFINER fonksiyonlarla)
drop policy if exists "credits_select_own" on public.credits;
create policy "credits_select_own" on public.credits
  for select using (auth.uid() = user_id);

-- CREDIT_TRANSACTIONS: yalnızca okuma
drop policy if exists "credit_tx_select_own" on public.credit_transactions;
create policy "credit_tx_select_own" on public.credit_transactions
  for select using (auth.uid() = user_id);

-- GENERATIONS: kullanıcı kendi üretimlerini görür/ekler/günceller
drop policy if exists "generations_select_own" on public.generations;
create policy "generations_select_own" on public.generations
  for select using (auth.uid() = user_id);
drop policy if exists "generations_insert_own" on public.generations;
create policy "generations_insert_own" on public.generations
  for insert with check (auth.uid() = user_id);
drop policy if exists "generations_update_own" on public.generations;
create policy "generations_update_own" on public.generations
  for update using (auth.uid() = user_id);

-- PACKAGES: aktif paketler herkese açık (anon dahil) okunur
drop policy if exists "packages_select_active" on public.packages;
create policy "packages_select_active" on public.packages
  for select using (is_active = true);

-- PURCHASES: kullanıcı kendi satın alımlarını görür
drop policy if exists "purchases_select_own" on public.purchases;
create policy "purchases_select_own" on public.purchases
  for select using (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- 10. BAŞLANGIÇ VERİSİ — kredi paketleri
-- ══════════════════════════════════════════════════════════════
insert into public.packages (name, description, credits, price_cents, currency, is_popular, sort_order)
select * from (values
  ('Başlangıç', '20 profesyonel görsel hakkı',    20,  24900, 'TRY', false, 1),
  ('Profesyonel', '60 görsel + öncelikli üretim',  60,  59900, 'TRY', true,  2),
  ('Stüdyo', '200 görsel + tüm şablonlar',        200, 169000, 'TRY', false, 3)
) as v(name, description, credits, price_cents, currency, is_popular, sort_order)
where not exists (select 1 from public.packages);

-- ── Mevcut kurulumlar için idempotent fiyat güncellemesi (2026-07-03) ──
-- Seed bloğu yalnızca tablo boşken çalışır; zaten dolu kurulumlarda paket
-- adına göre fiyat/kredi/açıklamayı yeni tarifeye taşır.
update public.packages
   set price_cents = 24900,
       credits     = 20,
       description = '20 profesyonel görsel hakkı'
 where name = 'Başlangıç';

update public.packages
   set price_cents = 59900,
       credits     = 60,
       description = '60 görsel + öncelikli üretim'
 where name = 'Profesyonel';

update public.packages
   set price_cents = 169000,
       credits     = 200,
       description = '200 görsel + tüm şablonlar'
 where name = 'Stüdyo';

-- ══════════════════════════════════════════════════════════════
-- 11. STORAGE — ürün görselleri için bucket
-- ══════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Kullanıcı yalnızca kendi klasörüne (user_id/...) yazabilir; okuma public.
drop policy if exists "product_images_read" on storage.objects;
create policy "product_images_read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product_images_insert_own" on storage.objects;
create policy "product_images_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "product_images_delete_own" on storage.objects;
create policy "product_images_delete_own" on storage.objects
  for delete using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
