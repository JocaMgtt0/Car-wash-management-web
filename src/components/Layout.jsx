import { NavLink, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import { useTema } from '../context/TemaContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { usePerfil } from '../context/PerfilContext.jsx'
import { useDados } from '../context/DadosContext.jsx'

const TABS = [
  { to: '/', rotulo: 'Calendário', icone: '📅', exato: true },
  { to: '/gastos', rotulo: 'Gastos', icone: '💸', perfilExigido: 'dono' },
  { to: '/relatorio', rotulo: 'Relatório', icone: '📊', perfilExigido: 'dono' },
  { to: '/equipe', rotulo: 'Equipe', icone: '🏷️' },
]

function IconeSol() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </svg>
  )
}

function IconeLua() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 14.3A8.6 8.6 0 0 1 9.7 3.5a8.6 8.6 0 1 0 10.8 10.8Z" />
    </svg>
  )
}

function Layout() {
  const { tema, alternarTema } = useTema()
  const { sair, usuario } = useAuth()
  const { perfil } = usePerfil()
  const { carregando, erroCarregamento } = useDados()
  const tabs = TABS.filter((tab) => !tab.perfilExigido || tab.perfilExigido === perfil?.role)

  return (
    <div className="app">
      <header className="topbar nao-imprimir">
        <span className="marca">
          <span className="marca-ponto" />
          Garage WM Lava Car
        </span>

        <div className="topbar-espaco" />

        {perfil && (
          <span className="perfil-badge" title={usuario?.email}>
            {perfil.nome}
            <span className="perfil-badge-role">
              {perfil.role === 'dono' ? 'Dono' : 'Funcionário'}
            </span>
          </span>
        )}

        <button
          className="tema-botao"
          onClick={alternarTema}
          aria-label={`Mudar para tema ${tema === 'escuro' ? 'claro' : 'escuro'}`}
          title={tema === 'escuro' ? 'Tema claro' : 'Tema escuro'}
        >
          <span className={tema === 'escuro' ? 'tema-icone visivel' : 'tema-icone oculto'}>
            <IconeLua />
          </span>
          <span className={tema === 'claro' ? 'tema-icone visivel' : 'tema-icone oculto'}>
            <IconeSol />
          </span>
        </button>

        <button
          className="sair-botao"
          onClick={sair}
          title={usuario?.email ? `Sair (${usuario.email})` : 'Sair'}
          aria-label="Sair"
        >
          Sair
        </button>
      </header>

      {/* Só aparece no desktop — no celular quem navega é a tab bar */}
      <Sidebar />

      <main className="conteudo">
        {erroCarregamento ? (
          <div className="vazio">
            <div className="vazio-icone">⚠️</div>
            <p>Não foi possível carregar os dados: {erroCarregamento}</p>
          </div>
        ) : carregando ? (
          <div className="vazio">
            <p>Carregando…</p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <nav className="tabbar nao-imprimir">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.exato}
            className={({ isActive }) => (isActive ? 'tab ativo' : 'tab')}
          >
            <span className="tab-icone">{tab.icone}</span>
            <span className="tab-rotulo">{tab.rotulo}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Layout
