-- Rota TMS: tabelas do protótipo. Execute no Supabase em SQL Editor → New query → Run.
-- Cada registro do app é guardado inteiro na coluna "data" (jsonb), identificado por "id".
--
-- ATENÇÃO: sem login, as políticas abaixo liberam leitura e escrita para qualquer pessoa
-- que tenha a URL do projeto e a chave anon (que fica visível no navegador). Use apenas
-- dados fictícios. Para dados reais, adicione Supabase Auth e restrinja as políticas.

do $$
declare t text;
begin
  foreach t in array array['company','drivers','models','vehicles','customers','cte_drafts','mdfe_drafts'] loop
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
