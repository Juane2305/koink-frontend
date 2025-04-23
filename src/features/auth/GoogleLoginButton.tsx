import { Button } from "../../components/ui/button"
import { FcGoogle } from "react-icons/fc"

export function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    window.location.href = "https://koink-backend-production.up.railway.app/oauth2/authorization/google"
  }

  return (
    <Button
      type="button"
      onClick={handleGoogleLogin}
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
    >
      <FcGoogle className="w-5 h-5" />
      Iniciar con Google
    </Button>
  )
}
