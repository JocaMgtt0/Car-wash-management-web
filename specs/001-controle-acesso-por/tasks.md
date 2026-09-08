---

description: "Task list for Controle de acesso por perfil (Dono / Funcionário)"
---

# Tasks: Controle de acesso por perfil (Dono / Funcionário)

**Input**: Design documents from `/specs/001-controle-acesso-por/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/politicas-acesso.md](./contracts/politicas-acesso.md)

**Tests**: Não exigidos explicitamente pelo spec desta feature — ver Fase Final para o item opcional de testes unitários da lógica de perfil (frente já em andamento separadamente: CI + Vitest).

**Organization**: Tarefas agrupadas por user story (spec.md), para que cada uma seja implementável e testável de forma independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência entre si)
- **[Story]**: a qual user story a tarefa pertence (US1, US2, US3)

## Path Conventions

Projeto único (sem pasta `backend/`): `src/` e `supabase/` na raiz do repositório, conforme `plan.md`.

---

## Phase 1: Setup

**Purpose**: Preparar o arquivo de schema antes de qualquer aplicação no banco

- [ ] T001 Atualizar `supabase/schema.sql` acrescentando a definição da tabela `perfis` (ver [data-model.md](./data-model.md)): colunas `id uuid primary key references auth.users(id) on delete cascade`, `nome text not null`, `role text not null check (role in ('dono','funcionario'))`, `created_at timestamptz not null default now()`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base de dados e contexto de perfil que TODAS as user stories dependem

**⚠️ CRITICAL**: nenhuma user story pode ser validada de ponta a ponta antes desta fase estar completa

- [ ] T002 Em `supabase/schema.sql`, criar a função `is_dono()` (`security definer`, `stable`) que retorna `exists(select 1 from perfis where id = auth.uid() and role = 'dono')`, conforme [research.md](./research.md) Decisão 3
- [ ] T003 Em `supabase/schema.sql`, reescrever as policies de `gastos` e `funcionarios` trocando `using (true) with check (true)` por `using (is_dono()) with check (is_dono())`, conforme o contrato em [contracts/politicas-acesso.md](./contracts/politicas-acesso.md)
- [ ] T004 Em `supabase/schema.sql`, ajustar a policy de `valores_padrao`: manter `select` liberado para todo `authenticated`, restringir `insert`/`update`/`delete` a `is_dono()`
- [ ] T005 Em `supabase/schema.sql`, criar as policies de `perfis`: `select` do próprio registro (`id = auth.uid()`) para qualquer autenticado; `insert`/`update`/`delete` restritos a `is_dono()`
- [ ] T006 Aplicar o `supabase/schema.sql` atualizado no SQL Editor do painel do Supabase (ambiente real do projeto)
- [ ] T007 Bootstrap manual: `insert into perfis (id, nome, role)` vinculando a conta atual da dona como `'dono'`, conforme [quickstart.md](./quickstart.md) passo 2
- [ ] T008 [P] Criar `apiPerfis` em `src/lib/api.js` (listar, criar/vincular, atualizar, remover), seguindo o mesmo padrão `crud()` já usado para as demais tabelas
- [ ] T009 [P] Criar `src/context/PerfilContext.jsx`: após login (via `useAuth`), busca o perfil vinculado à conta (`apiPerfis`), expõe `{ perfil, carregandoPerfil }` (`role`, `nome`) por um hook `usePerfil()`
- [ ] T010 Encaixar `PerfilProvider` em `src/App.jsx`, entre a checagem de `usuario` e o `DadosProvider`, para que o perfil esteja disponível antes de qualquer rota renderizar

**Checkpoint**: banco e contexto de perfil prontos — as user stories abaixo já podem ser implementadas

---

## Phase 3: User Story 1 - Funcionário não acessa dados financeiros (Priority: P1) 🎯 MVP

**Goal**: uma conta com perfil Funcionário só acessa calendário e lançamento de lavagens

**Independent Test**: logar com uma conta de perfil Funcionário e confirmar que `/gastos`, `/relatorio` e a aba de salários em `/equipe` estão inacessíveis, mesmo digitando a URL direto

- [ ] T011 [US1] Criar `src/components/RotaProtegida.jsx`: recebe o perfil exigido, usa `usePerfil()`, redireciona para `/` (`<Navigate replace>`) quando o perfil atual não corresponde
- [ ] T012 [US1] Em `src/App.jsx`, envolver as rotas `gastos` e `relatorio` com `<RotaProtegida perfilExigido="dono">`
- [ ] T013 [US1] Em `src/components/Sidebar.jsx`, filtrar os itens "Gastos" e "Relatório" do array `NAVEGACAO` quando `usePerfil().perfil.role !== 'dono'`
- [ ] T014 [US1] Em `src/pages/ServicosEquipe.jsx`, exibir a aba "Funcionários" (salários, `AbaFuncionarios`) somente quando `role === 'dono'`; a aba "Serviços" (`AbaServicos`) continua visível para os dois perfis, conforme FR-006
- [ ] T015 [US1] Criar tela `src/pages/AguardandoAcesso.jsx` ("Sua conta ainda não tem acesso liberado.") e usá-la em `src/App.jsx` quando `usuario` existe mas `usePerfil().perfil` é `null` após o carregamento, conforme FR-004 e o edge case "sem perfil vinculado"

**Checkpoint**: User Story 1 completa e testável de forma independente

---

## Phase 4: User Story 2 - Dona adiciona um novo funcionário sem e-mail de convite (Priority: P2)

**Goal**: a dona vincula uma conta já criada no Supabase a um perfil, colando o UUID, sem sair da interface

**Independent Test**: com uma conta de teste criada no Supabase, vincular UUID + nome + perfil pela aba "Adicionar membro" e confirmar que essa conta passa a logar com o perfil escolhido

- [ ] T016 [P] [US2] Em `src/pages/ServicosEquipe.jsx`, adicionar uma terceira aba "Adicionar membro" com formulário: campo UUID, campo nome, seletor de perfil (Dono/Funcionário)
- [ ] T017 [US2] Ao submeter, chamar `apiPerfis.criar`; em caso de erro de chave duplicada (perfil já vinculado) ou UUID inexistente (violação de FK), exibir mensagem amigável, conforme FR-008 (depende de T016, T008)
- [ ] T018 [US2] Na mesma aba, listar os perfis já vinculados (nome, papel) com ações de editar o papel ou remover o vínculo, conforme FR-007 (depende de T016, T008)
- [ ] T019 [US2] Ao remover um vínculo, confirmar via `useConfirmacao()` (padrão já usado nas outras exclusões da tela) antes de chamar `apiPerfis.remover`

**Checkpoint**: User Stories 1 e 2 funcionando lado a lado, de forma independente

---

## Phase 5: User Story 3 - Dona continua com acesso total (Priority: P3)

**Goal**: garantir que nada da User Story 1 regrediu o acesso de quem já tinha perfil Dono

**Independent Test**: logar com a conta da dona (perfil `dono`) e confirmar que calendário, gastos, relatório e equipe continuam idênticos ao comportamento atual do sistema

- [ ] T020 [US3] Validar manualmente, seguindo [quickstart.md](./quickstart.md) passo 3, que a conta com perfil `dono` mantém acesso a todas as telas existentes
- [ ] T021 [US3] Revisar `supabase/schema.sql` tabela por tabela contra [contracts/politicas-acesso.md](./contracts/politicas-acesso.md), confirmando que nenhuma policy ficou mais restritiva do que o previsto para o perfil `dono`

**Checkpoint**: as três user stories funcionam de forma independente e sem regressão

---

## Phase Final: Polish & Cross-Cutting Concerns

- [ ] T022 [P] Atualizar a seção "Segurança" do `README.md`, descrevendo o modelo de perfis (Dono/Funcionário) e o passo de bootstrap manual do primeiro Dono
- [ ] T023 Rodar o [quickstart.md](./quickstart.md) do início ao fim com uma conta de teste real antes de considerar a feature concluída
- [ ] T024 [P] (opcional — não exigido pelo spec) Se a suíte Vitest já estiver configurada nesta fase do projeto, adicionar teste unitário para a lógica de decisão de perfil usada em `RotaProtegida.jsx` e `Sidebar.jsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sem dependências, pode começar imediatamente
- **Foundational (Fase 2)**: depende da Fase 1 — bloqueia todas as user stories
- **User Stories (Fases 3-5)**: todas dependem da Fase 2 completa
  - US1 e US2 são independentes entre si e podem ser feitas em qualquer ordem após a Fase 2
  - US3 é essencialmente validação e depende de US1 já implementada (as policies e guardas de rota precisam existir para serem checadas)
- **Polish (Fase Final)**: depende das user stories desejadas estarem completas

### Parallel Opportunities

- T008 e T009 (Fase 2) podem rodar em paralelo — arquivos diferentes
- T016 (Fase 4) pode começar em paralelo a qualquer tarefa da Fase 3, já que mexe em uma aba nova dentro de `ServicosEquipe.jsx` independente da lógica de bloqueio
- T022 e T024 (Fase Final) podem rodar em paralelo

---

## Implementation Strategy

### MVP primeiro (User Story 1)

1. Completar Fase 1: Setup
2. Completar Fase 2: Foundational (bloqueia tudo)
3. Completar Fase 3: User Story 1
4. **Parar e validar**: testar a restrição de acesso isoladamente, com uma conta de funcionário real
5. Esse ponto já resolve o problema mais urgente (SC-001) mesmo sem a tela de autoatendimento da US2 pronta (a dona ainda pode pedir para alguém rodar o `insert` em `perfis` manualmente, como no bootstrap)

### Entrega incremental

1. Setup + Foundational → base pronta
2. User Story 1 → valida e resolve o risco de segurança (MVP)
3. User Story 2 → dona ganha autonomia para adicionar/remover funcionários sem depender de SQL manual
4. User Story 3 → checagem final de não regressão
5. Polish → documentação e testes opcionais

---

## Notes

- [P] = arquivos diferentes, sem dependência
- Cada user story deve ser completável e testável de forma independente
- Commit após cada tarefa ou grupo lógico de tarefas
- Parar em cada checkpoint para validar a story isoladamente antes de seguir
