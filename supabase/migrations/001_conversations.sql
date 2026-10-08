create table if not exists public.conversations (
  id text not null check (char_length(id) between 1 and 80),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  messages jsonb not null default '[]'::jsonb
    check (jsonb_typeof(messages) = 'array' and pg_column_size(messages) <= 2097152),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists conversations_user_updated_at_idx
  on public.conversations (user_id, updated_at desc);

alter table public.conversations enable row level security;

revoke all on table public.conversations from public, anon, authenticated;
grant select, insert, update, delete on table public.conversations to authenticated;

drop policy if exists "Users can manage their own conversations" on public.conversations;
create policy "Users can manage their own conversations"
  on public.conversations
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.set_conversation_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_conversation_updated_at() from public, anon, authenticated;

drop trigger if exists set_conversation_updated_at on public.conversations;
create trigger set_conversation_updated_at
  before update on public.conversations
  for each row
  execute function public.set_conversation_updated_at();
