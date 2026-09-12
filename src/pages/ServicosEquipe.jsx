import { useState } from 'react'
import BotaoVoltar from '../components/BotaoVoltar.jsx'
import { useDados } from '../context/DadosContext.jsx'
import { useAviso } from '../context/AvisoContext.jsx'
import { useConfirmacao } from '../context/ConfirmacaoContext.jsx'
import { usePerfil } from '../context/PerfilContext.jsx'
import { moeda, paraNumero } from '../lib/format.js'

const PERIODICIDADES = [
  { valor: 'mensal', rotulo: 'Mensal' },
  { valor: 'semanal', rotulo: 'Semanal' },
  { valor: 'diario', rotulo: 'Diário' },
]

const FATOR_MENSAL = { mensal: 1, semanal: 4.345, diario: 30 }

/* -------------------------------------------------------------- Serviços */

function AbaServicos() {
  const { valoresPadrao, adicionarValorPadrao, atualizarValorPadrao, removerValorPadrao } =
    useDados()
  const { avisar } = useAviso()
  const { confirmar } = useConfirmacao()

  const [aberto, setAberto] = useState(false)
  const [edicao, setEdicao] = useState(null)
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [erro, setErro] = useState('')

  const limpar = () => {
    setNome('')
    setValor('')
    setEdicao(null)
    setErro('')
  }

  const enviar = async (e) => {
    e.preventDefault()
    if (!nome.trim()) return setErro('Informe o nome do serviço.')

    const numero = paraNumero(valor)
    if (Number.isNaN(numero) || numero < 0) return setErro('Valor inválido.')

    const dados = { nome: nome.trim(), valor: numero }
    try {
      if (edicao) {
        await atualizarValorPadrao(edicao.id, dados)
        avisar('Serviço atualizado')
      } else {
        await adicionarValorPadrao(dados)
        avisar(`${dados.nome} adicionado`)
      }
      limpar()
      if (edicao) setAberto(false)
    } catch {
      setErro('Não foi possível salvar. Tente de novo.')
    }
  }

  const excluir = async (vp) => {
    const ok = await confirmar({
      mensagem: `Excluir o serviço "${vp.nome}"? As lavagens já registradas com ele não são afetadas.`,
    })
    if (!ok) return
    try {
      await removerValorPadrao(vp.id)
      avisar('Serviço excluído')
    } catch {
      avisar('Não foi possível excluir. Tente de novo.', 'erro')
    }
  }

  return (
    <>
      <section className="painel">
        <div className="painel-topo">
          <div>
            <h2>Serviços</h2>
            <p className="pagina-subtitulo">Atalhos de preço no lançamento da lavagem</p>
          </div>
          <button
            className={aberto ? 'btn btn-suave btn-pequeno' : 'btn btn-primario btn-pequeno'}
            onClick={() => {
              if (aberto) limpar()
              setAberto(!aberto)
            }}
          >
            {aberto ? 'Fechar' : '+ Serviço'}
          </button>
        </div>

        {aberto && (
          <form onSubmit={enviar} className="form caixa-form">
            <div className="campo-linha">
              <div className="campo">
                <label htmlFor="nome-servico">Nome</label>
                <input
                  id="nome-servico"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Lavagem simples"
                  autoComplete="off"
                />
              </div>
              <div className="campo">
                <label htmlFor="valor-servico">Valor</label>
                <input
                  id="valor-servico"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  inputMode="decimal"
                />
              </div>
            </div>

            {erro && <p className="campo-erro">{erro}</p>}

            <div className="form-acoes">
              <button type="button" className="btn btn-fantasma" onClick={limpar}>
                Limpar
              </button>
              <button type="submit" className="btn btn-primario">
                {edicao ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </form>
        )}

        {valoresPadrao.length === 0 ? (
          <div className="vazio">
            <div className="vazio-icone">🏷️</div>
            <p>
              Nenhum serviço cadastrado.
              <br />
              Cadastre os preços que mais usa para lançar lavagens em um toque.
            </p>
          </div>
        ) : (
          <ul className="lista">
            {valoresPadrao.map((vp) => (
              <li className="lista-item" key={vp.id}>
                <div className="lista-principal">
                  <div className="lista-titulo">{vp.nome}</div>
                </div>
                <span className="lista-valor num">{moeda(vp.valor)}</span>
                <div className="lista-acoes">
                  <button
                    className="btn-icone"
                    onClick={() => {
                      setEdicao(vp)
                      setNome(vp.nome)
                      setValor(String(vp.valor))
                      setAberto(true)
                    }}
                    aria-label="Editar"
                  >
                    ✎
                  </button>
                  <button
                    className="btn-icone perigo"
                    onClick={() => excluir(vp)}
                    aria-label="Excluir"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

/* ---------------------------------------------------------- Funcionários */

function AbaFuncionarios() {
  const {
    funcionarios,
    adicionarFuncionario,
    atualizarFuncionario,
    removerFuncionario,
    custoMensalFolha,
  } = useDados()
  const { avisar } = useAviso()
  const { confirmar } = useConfirmacao()

  const [aberto, setAberto] = useState(false)
  const [edicao, setEdicao] = useState(null)
  const [nome, setNome] = useState('')
  const [salario, setSalario] = useState('')
  const [periodicidade, setPeriodicidade] = useState('mensal')
  const [erro, setErro] = useState('')

  const limpar = () => {
    setNome('')
    setSalario('')
    setPeriodicidade('mensal')
    setEdicao(null)
    setErro('')
  }

  const enviar = async (e) => {
    e.preventDefault()
    if (!nome.trim()) return setErro('Informe o nome do funcionário.')

    const numero = paraNumero(salario)
    if (Number.isNaN(numero) || numero < 0) return setErro('Salário inválido.')

    const dados = { nome: nome.trim(), salario: numero, periodicidade }
    try {
      if (edicao) {
        await atualizarFuncionario(edicao.id, dados)
        avisar('Funcionário atualizado')
      } else {
        await adicionarFuncionario(dados)
        avisar(`${dados.nome} adicionado à equipe`)
      }
      limpar()
      if (edicao) setAberto(false)
    } catch {
      setErro('Não foi possível salvar. Tente de novo.')
    }
  }

  const excluir = async (f) => {
    const ok = await confirmar({
      mensagem: `Remover ${f.nome} da equipe? Os custos já lançados nos meses anteriores não são afetados.`,
      textoConfirmar: 'Remover',
    })
    if (!ok) return
    try {
      await removerFuncionario(f.id)
      avisar('Funcionário removido')
    } catch {
      avisar('Não foi possível remover. Tente de novo.', 'erro')
    }
  }

  return (
    <section className="painel">
      <div className="painel-topo">
        <div>
          <h2>Funcionários fixos</h2>
          <p className="pagina-subtitulo">Equipe com pagamento recorrente</p>
        </div>
        <button
          className={aberto ? 'btn btn-suave btn-pequeno' : 'btn btn-primario btn-pequeno'}
          onClick={() => {
            if (aberto) limpar()
            setAberto(!aberto)
          }}
        >
          {aberto ? 'Fechar' : '+ Funcionário'}
        </button>
      </div>

      {aberto && (
        <form onSubmit={enviar} className="form caixa-form">
          <div className="campo-linha">
            <div className="campo">
              <label htmlFor="nome-func">Nome</label>
              <input
                id="nome-func"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do funcionário"
                autoComplete="off"
              />
            </div>
            <div className="campo">
              <label htmlFor="salario-func">Salário</label>
              <input
                id="salario-func"
                value={salario}
                onChange={(e) => setSalario(e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
              />
            </div>
          </div>

          <div className="campo">
            <label>Forma de pagamento</label>
            <div className="segmentado largo">
              {PERIODICIDADES.map((p) => (
                <button
                  key={p.valor}
                  type="button"
                  className={periodicidade === p.valor ? 'ativo' : ''}
                  onClick={() => setPeriodicidade(p.valor)}
                >
                  {p.rotulo}
                </button>
              ))}
            </div>
          </div>

          {erro && <p className="campo-erro">{erro}</p>}

          <div className="form-acoes">
            <button type="button" className="btn btn-fantasma" onClick={limpar}>
              Limpar
            </button>
            <button type="submit" className="btn btn-primario">
              {edicao ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      )}

      {funcionarios.length === 0 ? (
        <div className="vazio">
          <div className="vazio-icone">👷</div>
          <p>
            Nenhum funcionário fixo cadastrado.
            <br />
            Diarista ou freelance do dia se lança direto no dia, em “Funcionário temporário”.
          </p>
        </div>
      ) : (
        <>
          <ul className="lista">
            {funcionarios.map((f) => {
              const equivalente = Number(f.salario) * (FATOR_MENSAL[f.periodicidade] ?? 1)
              return (
                <li className="lista-item" key={f.id}>
                  <div className="lista-principal">
                    <div className="lista-titulo">{f.nome}</div>
                    <div className="lista-meta">
                      {moeda(f.salario)} ·{' '}
                      {PERIODICIDADES.find((p) => p.valor === f.periodicidade)?.rotulo}
                      {f.periodicidade !== 'mensal' && ` · ~${moeda(equivalente)}/mês`}
                    </div>
                  </div>
                  <div className="lista-acoes">
                    <button
                      className="btn-icone"
                      onClick={() => {
                        setEdicao(f)
                        setNome(f.nome)
                        setSalario(String(f.salario))
                        setPeriodicidade(f.periodicidade)
                        setAberto(true)
                      }}
                      aria-label="Editar"
                    >
                      ✎
                    </button>
                    <button
                      className="btn-icone perigo"
                      onClick={() => excluir(f)}
                      aria-label="Remover"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="folha-total">
            <div>
              <span>Custo mensal da folha</span>
              <strong className="num">{moeda(custoMensalFolha())}</strong>
            </div>
          </div>

          <p className="aviso">
            A folha não vira despesa sozinha. No relatório do mês, use “Lançar folha” para
            registrá-la como custo — assim você controla em quais meses ela entra.
          </p>
        </>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ Página */

function ServicosEquipe() {
  const [aba, setAba] = useState('servicos')
  const { perfil } = usePerfil()
  const souDono = perfil?.role === 'dono'

  return (
    <>
      <BotaoVoltar />

      <div className="pagina-topo">
        <div className="pagina-titulo">
          <h1>Serviços e equipe</h1>
          <p className="pagina-subtitulo">Cadastros que alimentam lançamentos e relatórios</p>
        </div>
      </div>

      {souDono && (
        <div className="segmentado largo">
          <button className={aba === 'servicos' ? 'ativo' : ''} onClick={() => setAba('servicos')}>
            Serviços
          </button>
          <button className={aba === 'equipe' ? 'ativo' : ''} onClick={() => setAba('equipe')}>
            Funcionários
          </button>
        </div>
      )}

      {souDono && aba === 'equipe' ? <AbaFuncionarios /> : <AbaServicos />}
    </>
  )
}

export default ServicosEquipe
