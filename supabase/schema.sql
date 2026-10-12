-- Rota TMS: tabelas do protótipo. Execute no Supabase em SQL Editor → New query → Run.
-- Cada registro do app é guardado inteiro na coluna "data" (jsonb), identificado por "id".
--
-- ATENÇÃO: sem login, as políticas abaixo liberam leitura e escrita para qualquer pessoa
-- que tenha a URL do projeto e a chave anon (que fica visível no navegador). Use apenas
-- dados fictícios. Para dados reais, adicione Supabase Auth e restrinja as políticas.

do $$
declare t text;
begin
  foreach t in array array['company','drivers','models','vehicles','customers','cte_drafts','mdfe_drafts','users'] loop
    execute format('create table if not exists public.%I (
      id text primary key,
      data jsonb not null default %L,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )', t, '{}');
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "acesso publico do prototipo" on public.%I', t);
    execute format('create policy "acesso publico do prototipo" on public.%I for all to anon using (true) with check (true)', t);
    execute format('grant select, insert, update, delete on public.%I to anon', t);
  end loop;
end $$;

-- Senhas dos usuários: tabela sem acesso pelo app (nenhuma política para anon).
-- A senha só entra pela função set_user_password, que grava o hash bcrypt; o texto da senha não é armazenado.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.user_credentials (
  user_id text primary key,
  password_hash text not null,
  updated_at timestamptz not null default now()
);
alter table public.user_credentials enable row level security;
revoke all on public.user_credentials from anon, authenticated;

create or replace function public.set_user_password(p_user_id text, p_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_user_id is null or not exists (select 1 from public.users where id = p_user_id) then
    raise exception 'Usuário não encontrado';
  end if;
  if length(coalesce(p_password, '')) < 8 then
    raise exception 'A senha precisa ter ao menos 8 caracteres';
  end if;
  insert into public.user_credentials (user_id, password_hash, updated_at)
  values (p_user_id, crypt(p_password, gen_salt('bf')), now())
  on conflict (user_id) do update set password_hash = excluded.password_hash, updated_at = now();
end;
$$;
revoke all on function public.set_user_password(text, text) from public;
grant execute on function public.set_user_password(text, text) to anon;

-- Ao excluir um usuário, a senha dele também é apagada.
create or replace function public.delete_user_credentials()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.user_credentials where user_id = old.id;
  return old;
end;
$$;
drop trigger if exists users_delete_credentials on public.users;
create trigger users_delete_credentials after delete on public.users
  for each row execute function public.delete_user_credentials();

-- Faz a API do Supabase enxergar as tabelas novas imediatamente.
notify pgrst, 'reload schema';
