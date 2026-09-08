# Quickstart: validar o controle de acesso por perfil

Pré-requisito: `tasks.md` desta feature implementado (tabela `perfis`, policies reescritas, tela "Adicionar membro", guarda de rota).

1. **Aplicar a migration**: rodar o SQL atualizado de `supabase/schema.sql` (tabela `perfis`, função `is_dono()`, policies novas) no SQL Editor do painel do Supabase.
2. **Bootstrap do primeiro Dono**: no SQL Editor, rodar manualmente:
   ```sql
   insert into perfis (id, nome, role)
   values ('<uuid-da-conta-da-dona>', 'Nome da dona', 'dono');
   ```
   O UUID é copiado de Authentication → Users.
3. **Rodar localmente**: `npm run dev`, logar com a conta da dona.
   - Esperado: todas as telas atuais (calendário, gastos, relatório, equipe) continuam acessíveis, igual a hoje.
4. **Criar uma conta de teste de funcionário**: no painel do Supabase, Authentication → Users → Add user. Copiar o UUID gerado.
5. **Vincular o perfil pela interface**: na tela "Equipe" → aba "Adicionar membro", colar o UUID copiado, um nome de teste e escolher perfil "Funcionário".
6. **Validar a restrição**: logar com a conta de teste.
   - Esperado: consegue ver o calendário e lançar uma lavagem, usando os preços padrão.
   - Esperado: as rotas `/gastos`, `/relatorio` e a aba "Funcionários" (salários) dentro de `/equipe` ficam inacessíveis, tanto pelo menu (que nem aparece) quanto digitando a URL direto no navegador.
7. **Validar o caso "sem perfil"**: criar uma terceira conta no Supabase sem vincular nenhum perfil a ela, logar com ela.
   - Esperado: tela de "aguardando liberação de acesso", nenhum dado do negócio visível.
8. **Validar a revogação**: remover o perfil da conta de teste do funcionário (passo 5). Confirmar que ela perde o acesso, e que as lavagens lançadas por ela no passo 6 continuam aparecendo no calendário e no relatório da dona.
9. **Rodar os testes automatizados**, se já configurados nesta fase do projeto: `npm test` — deve cobrir a lógica de decisão de perfil (quem pode ver o quê).
