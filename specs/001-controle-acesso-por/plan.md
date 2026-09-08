# Implementation Plan: Controle de acesso por perfil (Dono / Funcionário)

**Branch**: `001-controle-acesso-por` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-controle-acesso-por/spec.md`

## Summary

Hoje qualquer conta autenticada tem acesso total ao sistema (RLS libera tudo para o papel `authenticated`). Esta feature introduz uma tabela `perfis` que vincula cada conta a um papel (Dono ou Funcionário), reescreve as políticas de RLS das tabelas sensíveis para checar esse papel, e adiciona uma tela para a dona vincular uma conta já criada no Supabase a um perfil colando o UUID que o próprio Supabase já gera, sem sistema de convite por e-mail.

## Technical Context

**Language/Version**: JavaScript (ES2022+), React 19

**Primary Dependencies**: React Router 7, `@supabase/supabase-js` 2, Vite 8

**Storage**: Supabase Postgres. Tabelas existentes: `lavagens`, `gastos`, `valores_padrao`, `funcionarios`. Nova tabela desta feature: `perfis`.

**Testing**: Vitest (introduzido em paralelo nesta mesma fase do projeto, ver frente de CI). A lógica de decisão de perfil (quem pode ver o quê) deve ganhar testes unitários por ser código de segurança.

**Target Platform**: Navegador, PWA mobile-first, hospedado na Vercel.

**Project Type**: Web app de página única (frontend React), sem backend próprio — Supabase como BaaS (arquitetura já vigente no projeto, não muda com esta feature).

**Performance Goals**: Nenhum requisito novo de performance; volume de dados é de um único negócio local (dezenas de registros por mês).

**Constraints**: Sem servidor próprio, então o Postgres RLS é o único ponto real de enforcement de segurança (o front fala direto com o Supabase usando a chave anônima). Não criar um identificador novo: reaproveitar o UUID que o Supabase Auth já gera para cada conta.

**Scale/Scope**: Um negócio, uma dona, poucos funcionários (ordem de unidades).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Este projeto ainda não tem `constitution.md` preenchido (`/speckit-constitution` não foi executado). Não há gates formais a verificar. Os princípios informais já acordados nas conversas de planejamento anteriores, e respeitados neste plano, são:

- Evitar overengineering: sem Edge Functions, sem `service_role` no front, sem sistema de convite por e-mail para este escopo.
- Reaproveitar infraestrutura existente em vez de criar nova: o identificador único é o UUID que o Supabase Auth já gera, não um ID inventado.
- Segurança real, não cosmética: toda restrição de acesso precisa existir na policy do banco (RLS), a guarda de rota no front é um complemento de UX, nunca a única proteção.

Nenhuma violação identificada. Seção "Complexity Tracking" fica vazia.

## Project Structure

### Documentation (this feature)

```text
specs/001-controle-acesso-por/
├── plan.md              # Este arquivo
├── research.md          # Fase 0
├── data-model.md         # Fase 1
├── quickstart.md          # Fase 1
├── contracts/              # Fase 1
│   └── politicas-acesso.md
└── tasks.md                 # Fase 2 (/speckit-tasks, não criado por este comando)
```

### Source Code (repository root)

```text
src/
├── context/
│   ├── AuthContext.jsx        # existente, sem mudança de responsabilidade
│   └── PerfilContext.jsx      # novo: busca o perfil (role) da conta logada e expõe via useAuth-like hook
├── components/
│   ├── RotaProtegida.jsx      # novo: guarda de rota que redireciona quem não tem o perfil exigido
│   └── Sidebar.jsx            # ajustado: esconde itens de navegação fora do perfil atual
├── pages/
│   └── ServicosEquipe.jsx     # ajustado: nova aba "Adicionar membro" (vincular UUID a perfil)
├── lib/
│   └── api.js                 # ajustado: apiPerfis (listar/vincular/atualizar/remover)
└── App.jsx                    # ajustado: rotas sensíveis envolvidas por <RotaProtegida>

supabase/
└── schema.sql                # ajustado: tabela perfis, função is_dono(), policies reescritas
```

**Structure Decision**: Projeto único (frontend React + Supabase BaaS), sem pasta de backend separada — mantém a arquitetura two-tier já vigente no projeto. Nenhuma nova pasta de nível superior é criada; a feature se encaixa na estrutura `context/ → components/ → pages/ → lib/` já existente.

## Complexity Tracking

*Vazio — nenhuma violação de constitution a justificar.*
