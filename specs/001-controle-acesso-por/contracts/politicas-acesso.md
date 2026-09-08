# Contrato: políticas de acesso por tabela (RLS)

Este projeto não expõe uma API própria — o "contrato" real é o conjunto de políticas de Row Level Security que o Postgres aplica a cada tabela, já que o frontend fala diretamente com o Supabase. Esta tabela é a referência que toda policy escrita na Fase de implementação deve satisfazer.

| Tabela | Dono | Funcionário | Sem perfil vinculado |
|---|---|---|---|
| `lavagens` | select, insert, update, delete | select, insert, update, delete | nenhum acesso |
| `valores_padrao` | select, insert, update, delete | **select apenas** (precisa ler os preços para lançar lavagem) | nenhum acesso |
| `gastos` | select, insert, update, delete | nenhum acesso | nenhum acesso |
| `funcionarios` (salários) | select, insert, update, delete | nenhum acesso | nenhum acesso |
| `perfis` | select, insert, update, delete (de qualquer perfil) | select apenas do próprio (`id = auth.uid()`) | nenhum acesso |

**Regra geral**: nenhuma tabela tem policy para o papel `anon` (usuário não autenticado) — isso já é verdade hoje e não muda.

**Mecanismo de checagem**: toda policy que precisa diferenciar Dono de Funcionário usa a função `is_dono()` (ver [research.md](../research.md), Decisão 3), nunca uma condição duplicada inline.

**Consumidores deste contrato**: `src/lib/api.js` (chamadas CRUD por tabela) e `supabase/schema.sql` (definição das policies). Se uma nova tabela for adicionada no futuro, esta tabela de referência deve ser atualizada antes da policy correspondente ser escrita.
