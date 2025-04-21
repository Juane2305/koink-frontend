import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Koink App</h1>
      <p className="text-muted-foreground mb-8">
        Gestión simple y segura de tus finanzas personales
      </p>
      <div className="flex gap-4">
        <Link to="/login">
          <Button>Iniciar sesión</Button>
        </Link>
        <Link to="/register">
          <Button variant="outline">Registrarse</Button>
        </Link>
      </div>
    </div>
  );
};
