import { RegisterForm } from "../features/auth/RegisterForm";
import { Link } from "react-router-dom";
import { PiggyBank, Sparkles } from "lucide-react";

export const RegisterPage = () => {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      
      {/* COLUMNA IZQUIERDA (Branding) */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0a0a0a] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0a0a0a] to-[#0a0a0a] -z-10"></div>

        <div className="flex items-center gap-2 text-2xl font-bold z-10">
          <PiggyBank className="h-8 w-8 text-indigo-500" />
          <span>Koink.</span>
        </div>
        
        <div className="z-10 mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Empieza tu viaje hoy
          </div>
          <h2 className="text-4xl font-bold tracking-tight leading-tight">
            Únete a miles de personas <br /> que ya dominan su dinero.
          </h2>
          <p className="text-lg text-gray-400 mt-4 max-w-md">
            Estás a solo unos pasos de tener una visión clara de tus finanzas. Configura tu perfil y empieza a ahorrar.
          </p>
        </div>

        <p className="text-sm text-gray-500 z-10">
          © {new Date().getFullYear()} Koink App.
        </p>
      </div>

      {/* COLUMNA DERECHA (Formulario) */}
      <div className="flex flex-col justify-center items-center p-6 lg:p-20 bg-background">
        <div className="w-full max-w-[450px] space-y-8">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
             <div className="lg:hidden flex justify-center mb-4">
                 <PiggyBank className="h-10 w-10 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Crear una cuenta</h1>
            <p className="text-sm text-muted-foreground">
              Completa los pasos para configurar tu nueva billetera digital.
            </p>
          </div>

          <div className="bg-white lg:border-none p-0 lg:shadow-none rounded-xl">
             <RegisterForm />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="underline underline-offset-4 hover:text-primary font-medium text-indigo-600"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};