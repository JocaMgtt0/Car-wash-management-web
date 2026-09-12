import { Navigate } from 'react-router-dom'
import { usePerfil } from '../context/PerfilContext.jsx'

function RotaProtegida({ perfilExigido, children }) {
  const { perfil } = usePerfil()

  if (perfil?.role !== perfilExigido) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RotaProtegida
