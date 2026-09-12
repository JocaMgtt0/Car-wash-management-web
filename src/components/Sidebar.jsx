import { NavLink } from 'react-router-dom'
import { usePerfil } from '../context/PerfilContext.jsx'

const NAVEGACAO = [
  { to: '/', rotulo: 'Calendário', icone: '📅', exato: true },
  { to: '/gastos', rotulo: 'Gastos', icone: '💸', perfilExigido: 'dono' },
  { to: '/relatorio', rotulo: 'Relatório', icone: '📊', perfilExigido: 'dono' },
  { to: '/equipe', rotulo: 'Serviços e equipe', icone: '🏷️' },
]

/**
 * Rail de navegação exclusivo do desktop: 68px só com ícones, expande no
 * hover (CSS puro). No celular fica oculto — lá quem navega é a tab bar.
 */
function Sidebar() {
  const { perfil } = usePerfil()
  const itens = NAVEGACAO.filter((item) => !item.perfilExigido || item.perfilExigido === perfil?.role)

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {itens.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exato}
            className={({ isActive }) => (isActive ? 'sidebar-link ativo' : 'sidebar-link')}
            title={item.rotulo}
          >
            <span className="sidebar-icone">{item.icone}</span>
            <span className="sidebar-rotulo">{item.rotulo}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
