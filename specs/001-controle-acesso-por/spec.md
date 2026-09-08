# Feature Specification: Controle de acesso por perfil (Dono / Funcionário)

**Feature Branch**: `001-controle-acesso-por`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "Controle de acesso por perfil dono e funcionario no sistema do lava-jato, com tela para a dona adicionar um novo funcionario colando o ID unico gerado no Supabase, sem sistema de convite por email"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Funcionário não acessa dados financeiros (Priority: P1)

Hoje, qualquer pessoa que faça login no sistema tem acesso total: gastos, salários da equipe e relatório financeiro. Um funcionário que só deveria lançar lavagens do dia consegue ver (e mexer) em tudo, inclusive quanto cada colega ganha. Essa história garante que uma conta marcada como Funcionário só acessa o calendário e o lançamento de lavagens, nunca dados financeiros ou de folha de pagamento.

**Why this priority**: É o problema real mais urgente. Sem isso, o sistema expõe informação sensível (salários, faturamento) a qualquer pessoa com uma conta de login, independentemente da intenção da dona ao criar aquela conta.

**Independent Test**: Criar uma conta de teste marcada como Funcionário, logar com ela e confirmar que as telas de Gastos, Relatório e Funcionários (aba de salários) não aparecem nem são acessíveis, mesmo digitando o endereço diretamente.

**Acceptance Scenarios**:

1. **Given** uma conta marcada como Funcionário, **When** o usuário faz login, **Then** ele vê apenas o calendário e consegue lançar lavagens do dia.
2. **Given** uma conta marcada como Funcionário logada, **When** o usuário tenta acessar a tela de Gastos, Relatório ou a lista de salários da equipe, **Then** o acesso é negado e ele é redirecionado de volta ao calendário.
3. **Given** uma conta marcada como Funcionário, **When** ela tenta obter os dados financeiros por qualquer outro caminho que não a interface (ex.: requisição direta), **Then** o sistema também nega o acesso, não apenas a tela esconde o link.

---

### User Story 2 - Dona adiciona um novo funcionário sem e-mail de convite (Priority: P2)

A dona cria a conta de login do funcionário manualmente (como já faz hoje, pelo painel do Supabase) e depois precisa dizer ao sistema "essa conta é de um Funcionário, chama-se Fulano". Isso é feito colando um identificador único que já existe para aquela conta, sem depender de nenhum e-mail de convite.

**Why this priority**: Vem logo depois da restrição de acesso porque sem uma forma de vincular perfil a conta, a User Story 1 não tem como ser operada no dia a dia — toda conta nova ficaria sem perfil.

**Independent Test**: Com uma conta de login já criada no painel do Supabase, a dona consegue, dentro do próprio sistema, vincular essa conta a um nome e a um perfil (Dono ou Funcionário) em poucos passos, sem sair para nenhum e-mail.

**Acceptance Scenarios**:

1. **Given** uma conta de login já criada no Supabase mas ainda sem perfil, **When** a dona informa o identificador único dessa conta, um nome de exibição e escolhe o perfil "Funcionário", **Then** essa conta passa a logar com acesso restrito de funcionário.
2. **Given** um identificador inválido ou de uma conta inexistente, **When** a dona tenta vinculá-lo, **Then** o sistema recusa e explica que o identificador não corresponde a nenhuma conta.
3. **Given** um funcionário que saiu do lava-jato, **When** a dona remove o vínculo de perfil dele, **Then** essa conta perde todo acesso ao sistema, mas as lavagens e gastos que ele já lançou continuam no histórico normalmente.

---

### User Story 3 - Dona continua com acesso total (Priority: P3)

A própria dona precisa continuar enxergando e editando tudo (calendário, gastos, relatório, equipe), exatamente como o sistema já funciona hoje, agora sob o perfil "Dono".

**Why this priority**: É o comportamento atual do sistema; entra como história separada só para garantir que a mudança não regride o acesso de quem já usa tudo.

**Independent Test**: Logar com a conta da dona (perfil Dono) e confirmar que todas as telas existentes continuam acessíveis, sem nenhuma tela nova bloqueada por engano.

**Acceptance Scenarios**:

1. **Given** uma conta marcada como Dono, **When** ela faz login, **Then** todas as telas atuais (calendário, gastos, relatório, equipe) continuam acessíveis normalmente.

---

### Edge Cases

- O que acontece quando uma conta loga e ainda não tem nenhum perfil vinculado (nem Dono, nem Funcionário)? O sistema não pode liberar acesso a nada por padrão nesse caso, precisa mostrar uma tela de "aguardando liberação".
- Como o próprio primeiro perfil "Dono" é criado, já que só um Dono pode cadastrar perfis? Esse primeiro vínculo precisa de um passo manual único de configuração inicial (fora da interface), feito uma única vez.
- O que acontece se a dona colar um identificador que já está vinculado a outro perfil? O sistema deve avisar que aquele identificador já está em uso, em vez de duplicar ou sobrescrever silenciosamente.
- Um funcionário removido não pode simplesmente "sumir" do histórico: lavagens e gastos que ele lançou continuam existindo e visíveis para a dona.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST reconhecer dois perfis de acesso distintos: Dono e Funcionário.
- **FR-002**: O sistema MUST impedir que contas com perfil Funcionário visualizem ou alterem gastos, relatório financeiro e salários da equipe, tanto pela interface quanto por qualquer tentativa de acesso direto aos dados.
- **FR-003**: O sistema MUST permitir que a dona vincule uma conta de login já existente a um perfil (Dono ou Funcionário) e a um nome de exibição, usando o identificador único já associado a essa conta.
- **FR-004**: O sistema MUST negar todo acesso aos dados do negócio para qualquer conta autenticada que ainda não tenha um perfil vinculado.
- **FR-005**: O sistema MUST continuar impedindo o cadastro público de novas contas (comportamento já existente, não pode regredir com esta mudança).
- **FR-006**: Contas com perfil Funcionário MUST conseguir visualizar os preços padrão de serviço, necessários para lançar uma lavagem.
- **FR-007**: O sistema MUST permitir que a dona altere o perfil de uma conta existente ou remova seu vínculo, revogando o acesso sem apagar os lançamentos que essa conta já fez.
- **FR-008**: O sistema MUST avisar a dona quando ela tentar vincular um identificador que não corresponde a nenhuma conta existente, ou que já está vinculado a outro perfil.

### Key Entities

- **Perfil**: liga uma conta de login já existente a um papel de acesso (Dono ou Funcionário) e a um nome de exibição. É o que decide o que aquela conta pode ver e fazer no sistema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma conta com perfil Funcionário não consegue visualizar nenhum valor de gasto, faturamento ou salário em nenhuma tela do sistema, em 100% dos casos testados.
- **SC-002**: A dona consegue dar acesso a um novo funcionário (do momento em que a conta de login existe até ele conseguir lançar a primeira lavagem) em menos de 2 minutos, sem enviar nenhum e-mail.
- **SC-003**: Toda conta autenticada sem perfil vinculado fica sem acesso a qualquer dado do negócio, sem exceção.
- **SC-004**: A dona consegue revogar o acesso de um funcionário a qualquer momento, e os lançamentos feitos por ele antes da revogação continuam intactos no histórico.

## Assumptions

- A criação da conta de login (e-mail/senha) continua manual, feita pela dona diretamente no painel do Supabase, como já acontece hoje — esta funcionalidade não muda esse passo.
- O "identificador único" é o mesmo identificador que o Supabase já gera automaticamente para cada conta no momento em que ela é criada; não é necessário inventar ou gerar um identificador novo.
- Existe uma única dona operando o negócio nesta versão; o modelo de perfil não impede múltiplos Donos no futuro, mas isso não é um requisito agora.
- O vínculo do primeiro perfil "Dono" (necessário para que exista alguém com permissão de cadastrar os demais) é um passo único de configuração inicial, feito fora da interface comum de "adicionar membro".
