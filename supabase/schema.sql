-- WF Lava Car — schema inicial
--
-- Como rodar: no painel do Supabase, vá em "SQL Editor" (menu lateral) →
-- "New query" → cole este arquivo inteiro → "Run".
--
-- O projeto foi criado com "Enable automatic RLS", então toda tabela nova já
-- nasce travada (ninguém lê/escreve nada até uma policy liberar). E como
-- "Automatically expose new tables" ficou desmarcado, também precisamos dar
-- GRANT explícito — por isso os dois blocos abaixo, não só as policies.

create table if not exists lavagens (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  cliente text,
  modelo text not null,
  placa text,
  servico text,
  valor numeric(10,2) not null check (valor >= 0),
  created_at timestamptz not null default now()
);

create table if not exists gastos (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  valor numeric(10,2) not null check (valor >= 0),
  tipo text not null check (tipo in ('diario', 'mensal')),
  categoria text not null default 'geral' check (categoria in ('geral', 'funcionario')),
  data date,
  competencia text,
  created_at timestamptz not null default now(),
  constraint gasto_tem_data_ou_competencia check (
    (tipo = 'diario' and data is not null) or
    (tipo = 'mensal' and competencia is not null)
  )
);

create table if not exists valores_padrao (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  valor numeric(10,2) not null check (valor >= 0),
  created_at timestamptz not null default now()
);

create table if not exists funcionarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  salario numeric(10,2) not null check (salario >= 0),
  periodicidade text not null check (periodicidade in ('mensal', 'semanal', 'diario')),
  created_at timestamptz not null default now()
);

-- Perfis: liga uma conta de login já existente (auth.users) a um papel de
-- acesso. É a única fonte de verdade sobre o que uma conta pode ver e fazer
-- no sistema — conta autenticada sem linha aqui não acessa nada do negócio.
create table if not exists perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  role text not null check (role in ('dono', 'funcionario')),
  created_at timestamptz not null default now()
);

-- Privilégio de tabela (GRANT) — sem isso, mesmo com policy liberando,
-- o papel "authenticated" não tem permissão de tentar a operação.
grant select, insert, update, delete on lavagens to authenticated;
grant select, insert, update, delete on gastos to authenticated;
grant select, insert, update, delete on valores_padrao to authenticated;
grant select, insert, update, delete on funcionarios to authenticated;
grant select, insert, update, delete on perfis to authenticated;

-- Row Level Security — redundante com o "Enable automatic RLS" do projeto,
-- mas explícito aqui para o schema não depender de configuração externa.
alter table lavagens enable row level security;
alter table gastos enable row level security;
alter table valores_padrao enable row level security;
alter table funcionarios enable row level security;
alter table perfis enable row level security;

-- is_dono(): função auxiliar reaproveitada pelas policies abaixo, em vez de
-- repetir a mesma subquery em cada uma. "security definer" faz ela enxergar
-- a tabela perfis mesmo com RLS ativo, sem depender de uma policy de perfis
-- liberar essa leitura (senão a checagem viraria referência circular).
create or replace function is_dono()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from perfis where id = auth.uid() and role = 'dono'
  );
$$;

-- lavagens: dono e funcionário lançam e enxergam igual — é o registro de
-- trabalho do dia a dia, não é dado financeiro sensível por si só.
create policy "Autenticado tem acesso total" on lavagens
  for all to authenticated using (true) with check (true);

-- valores_padrao: qualquer autenticado LÊ (o funcionário precisa dos preços
-- padrão pra lançar uma lavagem), só o dono cria, edita ou remove um preço.
create policy "Autenticado le os precos padrao" on valores_padrao
  for select to authenticated using (true);

create policy "Dono cria precos padrao" on valores_padrao
  for insert to authenticated with check (is_dono());

create policy "Dono atualiza precos padrao" on valores_padrao
  for update to authenticated using (is_dono()) with check (is_dono());

create policy "Dono remove precos padrao" on valores_padrao
  for delete to authenticated using (is_dono());

-- gastos e funcionarios: dado financeiro e de salário — só o dono acessa,
-- em nenhuma operação. Funcionário autenticado não vê nem lançamento algum.
create policy "Dono acessa gastos" on gastos
  for all to authenticated using (is_dono()) with check (is_dono());

create policy "Dono acessa funcionarios" on funcionarios
  for all to authenticated using (is_dono()) with check (is_dono());

-- perfis: qualquer autenticado lê o PRÓPRIO perfil (pra saber sua role ao
-- logar); só o dono cria, edita ou remove o perfil de qualquer conta.
create policy "Cada um le o proprio perfil" on perfis
  for select to authenticated using (id = auth.uid());

create policy "Dono cria perfis" on perfis
  for insert to authenticated with check (is_dono());

create policy "Dono atualiza perfis" on perfis
  for update to authenticated using (is_dono()) with check (is_dono());

create policy "Dono remove perfis" on perfis
  for delete to authenticated using (is_dono());
