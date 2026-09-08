# Data Model: Controle de acesso por perfil (Dono / Funcionário)

## Entidade: Perfil

Liga uma conta de login já existente (`auth.users`) a um papel de acesso e a um nome de exibição. É a única fonte de verdade sobre o que uma conta pode ver e fazer no sistema.

| Campo | Tipo | Regras |
|---|---|---|
| `id` | uuid | Chave primária. Referencia `auth.users(id)`. `on delete cascade` — se a conta de login for apagada, o perfil some junto. |
| `nome` | text | Obrigatório. Nome de exibição escolhido pela dona ao vincular o perfil. |
| `role` | text | Obrigatório. Restrito a `'dono'` ou `'funcionario'` (check constraint). |
| `created_at` | timestamptz | Preenchido automaticamente na criação. |

**Relacionamentos**: 1:1 com `auth.users` (cada conta tem no máximo um perfil).

**Regras de validação**:
- `role` fora de `('dono', 'funcionario')` é rejeitado pelo banco (check constraint), não só pela interface.
- Não é possível ter dois perfis para o mesmo `id` (é chave primária).
- Remover o perfil de uma conta não apaga `lavagens` ou `gastos` que ela lançou — essas tabelas não têm relação de exclusão em cascata com `perfis`.

**Transições de estado**: uma conta passa por três estados possíveis em relação a este modelo:
1. **Sem perfil** — conta existe em `auth.users`, mas não tem linha em `perfis`. Sem acesso a nada (FR-004).
2. **Perfil funcionário** — acesso restrito (calendário, lançamento de lavagem, leitura de serviços padrão).
3. **Perfil dono** — acesso total, incluindo a capacidade de criar/editar/remover perfis de outras contas.

Não existe transição automática entre estados; toda mudança é uma ação explícita da dona (FR-003, FR-007).
