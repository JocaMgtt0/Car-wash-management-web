# Research: Controle de acesso por perfil (Dono / Funcionário)

## Decisão 1: reaproveitar o UUID do Supabase Auth como identificador único

**Decision**: O "ID único" do funcionário é o mesmo UUID que o Supabase já gera automaticamente para toda conta em `auth.users`. Não é criado nenhum identificador novo.

**Rationale**: Esse UUID já existe, já é único, já é visível para a dona no painel do Supabase (Authentication → Users) e já pode ser copiado com um clique. Inventar um segundo identificador seria redundante e é exatamente o tipo de complexidade desnecessária que este projeto já decidiu evitar (ver princípio "anti-overengineering" acordado no planejamento).

**Alternatives considered**: Gerar um código de convite próprio (ex.: string curta de 6 dígitos). Rejeitado porque exigiria uma função server-side (Edge Function) para emitir e validar esse código com segurança, o que reintroduz a complexidade de backend que o sistema de convite por e-mail (adiado) também teria.

## Decisão 2: aplicar a restrição de acesso em duas camadas (RLS + rota no front)

**Decision**: A regra "Funcionário não vê dados financeiros" é aplicada tanto nas políticas de RLS do Postgres (via função `is_dono()`) quanto numa guarda de rota no React.

**Rationale**: O frontend fala diretamente com o Supabase usando a chave anônima (pública por natureza). Uma guarda de rota sozinha só esconde o link na interface, mas não impede uma chamada direta à API do Supabase. O RLS é o único ponto onde a restrição é de fato garantida pelo banco, independentemente de qual código faz a chamada.

**Alternatives considered**: Confiar apenas na guarda de rota do front. Rejeitado por ser proteção cosmética, sem valor de segurança real.

## Decisão 3: função `is_dono()` reaproveitada, em vez de repetir a subquery em cada policy

**Decision**: Uma única função SQL `is_dono() returns boolean`, marcada `security definer`, consultada pelas policies de `gastos`, `funcionarios` e `perfis`.

**Rationale**: Evita duplicar a mesma subquery (`select exists (...) from perfis where id = auth.uid() and role = 'dono'`) em várias policies, reduzindo o risco de uma delas ficar desatualizada se a regra mudar. `security definer` evita problemas de a própria policy de `perfis` bloquear a leitura que a função precisa fazer.

**Alternatives considered**: Repetir a subquery inline em cada policy. Rejeitado por duplicação e maior chance de inconsistência futura.

## Decisão 4: primeiro perfil "Dono" é um passo manual único (bootstrap)

**Decision**: Como só um Dono pode cadastrar novos perfis pela interface, o primeiro vínculo (a própria conta da dona virar perfil "dono") é feito com um único `insert` manual no SQL Editor do Supabase, não pela tela "Adicionar membro".

**Rationale**: É um problema clássico de "quem cadastra o primeiro administrador" — não há como a interface resolver isso sozinha sem já existir alguém com permissão de usá-la. Um passo manual único, documentado, é mais simples do que criar um mecanismo especial só para esse caso raro (acontece uma vez por instalação do sistema).

**Alternatives considered**: Lógica especial de "primeiro usuário vira dono automaticamente". Rejeitado por adicionar complexidade permanente ao código para resolver um evento que só acontece uma vez.
