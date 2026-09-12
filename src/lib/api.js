import { supabase } from './supabaseClient.js'

/**
 * Camada de acesso a dados via Supabase.
 * Cada entidade expõe listar/criar/atualizar/remover — sempre devolvendo
 * `{ data, error }` cru do supabase-js, para quem chama decidir como tratar.
 */

function crud(tabela, ordenarPor = 'created_at') {
  return {
    listar: async () => supabase.from(tabela).select('*').order(ordenarPor, { ascending: true }),

    criar: async (dados) => supabase.from(tabela).insert(dados).select().single(),

    atualizar: async (id, dados) =>
      supabase.from(tabela).update(dados).eq('id', id).select().single(),

    remover: async (id) => supabase.from(tabela).delete().eq('id', id),
  }
}

export const apiLavagens = crud('lavagens', 'data')
export const apiGastos = crud('gastos')
export const apiValoresPadrao = crud('valores_padrao', 'nome')
export const apiFuncionarios = crud('funcionarios', 'nome')
export const apiPerfis = crud('perfis', 'nome')
