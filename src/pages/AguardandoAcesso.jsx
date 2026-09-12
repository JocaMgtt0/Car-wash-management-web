import { useAuth } from '../context/AuthContext.jsx'

function AguardandoAcesso() {
  const { sair } = useAuth()

  return (
    <div className="carregando-tela">
      <div className="carregando-marca">
        <span className="marca-ponto" />
        Aguardando liberação de acesso
      </div>
      <p className="pagina-subtitulo">
        Sua conta ainda não tem um perfil vinculado. Peça para a dona liberar seu acesso.
      </p>
      <button className="btn btn-suave" onClick={sair}>
        Sair
      </button>
    </div>
  )
}

export default AguardandoAcesso
