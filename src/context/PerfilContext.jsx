import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './AuthContext.jsx'

const PerfilContext = createContext(null)

export function PerfilProvider({ children }) {
  const { usuario } = useAuth()
  const [perfil, setPerfil] = useState(undefined) // undefined = ainda não sabemos

  useEffect(() => {
    if (!usuario) {
      setPerfil(null)
      return
    }

    let cancelado = false
    setPerfil(undefined)

    supabase
      .from('perfis')
      .select('id, nome, role')
      .eq('id', usuario.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelado) setPerfil(data ?? null)
      })

    return () => {
      cancelado = true
    }
  }, [usuario])

  return (
    <PerfilContext.Provider value={{ perfil, carregandoPerfil: perfil === undefined }}>
      {children}
    </PerfilContext.Provider>
  )
}

export function usePerfil() {
  const ctx = useContext(PerfilContext)
  if (!ctx) throw new Error('usePerfil precisa estar dentro de <PerfilProvider>')
  return ctx
}
