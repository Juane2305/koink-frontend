import { LoginForm } from "../features/auth/LoginForm";
import { Link } from "react-router-dom";
import { PiggyBank } from "lucide-react"; // Usamos este icono como logo temporal

export const LoginPage = () => {
  return (
    // Contenedor principal: Pantalla completa, grid de 2 columnas en desktop
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      
      {/* COLUMNA IZQUIERDA (Branding - Solo visible en desktop) */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0a0a0a] p-10 text-white relative overflow-hidden">
        {/* Efecto de fondo sutil (un círculo de luz) */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0a0a0a] to-[#0a0a0a] -z-10"></div>

        {/* Logo y Nombre */}
        <div className="flex items-center gap-2 text-2xl font-bold z-10">
          <PiggyBank className="h-8 w-8 text-indigo-500" />
          <span>Koink.</span>
        </div>
        
        {/* Frase inspiradora */}
        <div className="z-10 mb-20">
          <h2 className="text-4xl font-bold tracking-tight leading-tight">
            Toma el control de <br /> tus finanzas personales.
          </h2>
          <p className="text-lg text-gray-400 mt-4 max-w-md">
            Administra tus ingresos, controla tus gastos y alcanza tus metas financieras con una plataforma simple y potente.
          </p>
        </div>

        {/* Footer pequeño */}
        <p className="text-sm text-gray-500 z-10">
          © {new Date().getFullYear()} Koink App. Hecho por Juane.
        </p>
      </div>

      {/* COLUMNA DERECHA (Formulario) */}
      <div className="flex flex-col justify-center items-center p-6 lg:p-24 bg-background">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="flex flex-col space-y-2 text-center">
            {/* Logo visible solo en móvil */}
            <div className="lg:hidden flex justify-center mb-4">
                 <PiggyBank className="h-10 w-10 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tu email y contraseña para acceder a tu cuenta.
            </p>
          </div>

          {/* El componente del formulario que ya tenías */}
          <LoginForm />

          <p className="px-8 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/register"
              className="underline underline-offset-4 hover:text-primary font-medium text-indigo-600"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};