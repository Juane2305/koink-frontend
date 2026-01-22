import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { PiggyBank, ArrowRight, ShieldCheck } from "lucide-react";

export const WelcomePage = () => {
  return (
    // Usamos un fondo oscuro para un look premium
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col">
      {/* NAVBAR SIMPLE */}
      <header className="container mx-auto p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <PiggyBank className="h-8 w-8 text-indigo-500" />
          <span>Koink.</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login">
            <Button
              variant="ghost"
              className="text-white hover:text-indigo-400 hover:bg-white/10"
            >
              Ingresar
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Crear cuenta
            </Button>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 container mx-auto flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 relative z-10">
        {/* Efecto de luz de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10"></div>

        {/* Badge pequeña */}
        <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 mb-6 backdrop-blur-sm">
          <ShieldCheck className="h-4 w-4 mr-2" /> Finanzas personales
          simplificadas
        </div>

        {/* Título Principal */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
          Tu dinero, <br /> bajo tu control.
        </h1>

        {/* Subtítulo */}
        <p className="text-xl text-gray-400 max-w-2xl mb-12">
          Koink te ayuda a trackear tus gastos, crear presupuestos inteligentes
          y visualizar tu crecimiento financiero. Deja de adivinar a dónde va tu
          dinero.
        </p>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link to="/register">
            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg h-auto w-full sm:w-auto group"
            >
              Comenzar ahora gratis
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-gray-700 text-black hover:bg-white/10 hover:text-white px-8 py-6 text-lg h-auto w-full sm:w-auto"
            >
              Ya tengo cuenta
            </Button>
          </Link>
        </div>

        {/* MOCKUP DEL DASHBOARD (Placeholder visual) */}
        <div className="relative w-full max-w-5xl mx-auto">
          {/* Borde brillante */}
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent rounded-xl blur-xl -z-10"></div>

          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm p-2">
            {/* Barra de título del navegador falsa */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800/50 bg-black/20">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              <div className="flex-1 text-center text-xs text-gray-500 font-mono">
                dashboard.koink.app
              </div>
            </div>

            {/* AQUÍ VA LA IMAGEN DE TU DASHBOARD */}
            {/* Reemplaza este div por: <img src="/dashboard-screenshot.png" alt="App Screenshot" className="w-full rounded-b-lg" /> */}
            <div className="aspect-video w-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-gray-700">
              {/* Reemplaza el div gris grande por esto: */}
              <img
                src="/dashboard-shot.png"
                alt="Koink Dashboard"
                className="w-full h-auto rounded-b-lg"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer simple */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-900 z-10">
        <p>
          © {new Date().getFullYear()} Koink. Un proyecto de Juane Elizondo.
        </p>
      </footer>
    </div>
  );
};
