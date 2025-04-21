import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"

export const WelcomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-2xl font-bold">🎉 ¡Bienvenido a Koink!</h1>
      <p className="text-gray-600 max-w-md">
        Nos alegra que estés acá. Ya estás registrado con tu cuenta de Google. Si querés, podés completar tu perfil luego desde la configuración.
      </p>
      <Button onClick={() => navigate("/dashboard")}>
        Ir al dashboard
      </Button>
    </div>
  )
}
