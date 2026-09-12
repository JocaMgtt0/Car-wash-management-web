import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Agenda from './pages/Agenda.jsx'
import Dia from './pages/Dia.jsx'
import Gastos from './pages/Gastos.jsx'
import Relatorio from './pages/Relatorio.jsx'
import ServicosEquipe from './pages/ServicosEquipe.jsx'
import AguardandoAcesso from './pages/AguardandoAcesso.jsx'
import RotaProtegida from './components/RotaProtegida.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { PerfilProvider, usePerfil } from './context/PerfilContext.jsx'
import { DadosProvider } from './context/DadosContext.jsx'

function TelaCarregando() {
  return (
    <div className="carregando-tela">
      <div className="carregando-marca">
        <span className="marca-ponto" />
        Garage WM Lava Car
      </div>
    </div>
  )
}

function ConteudoAutenticado() {
  const { perfil, carregandoPerfil } = usePerfil()

  if (carregandoPerfil) return <TelaCarregando />

  if (!perfil) return <AguardandoAcesso />

  return (
    <DadosProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Agenda />} />
          <Route path="dia/:data" element={<Dia />} />
          <Route
            path="gastos"
            element={
              <RotaProtegida perfilExigido="dono">
                <Gastos />
              </RotaProtegida>
            }
          />
          <Route
            path="relatorio"
            element={
              <RotaProtegida perfilExigido="dono">
                <Relatorio />
              </RotaProtegida>
            }
          />
          <Route path="equipe" element={<ServicosEquipe />} />
          <Route path="valores" element={<Navigate to="/equipe" replace />} />
          <Route path="login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DadosProvider>
  )
}

function App() {
  const { usuario, carregandoSessao } = useAuth()

  if (carregandoSessao) return <TelaCarregando />

  if (!usuario) return <Login />

  return (
    <PerfilProvider>
      <ConteudoAutenticado />
    </PerfilProvider>
  )
}

export default App
