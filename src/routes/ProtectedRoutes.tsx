import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      // Usamos el mismo color de fondo y estilo que el splash screen del index.html
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0a0a0a]">
        <img 
          src="https://res.cloudinary.com/dfschbyq2/image/upload/v1745361152/Blue_Modern_Letter_K_Logo_xmupfi.png" 
          className="w-20 h-20 mb-5 animate-pulse" 
          alt="Cargando Koink" 
        />
        <div className="w-24 h-0.5 bg-white/10 overflow-hidden">
          <div className="w-full h-full bg-indigo-500 animate-[loading_1.5s_infinite_ease-in-out]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};