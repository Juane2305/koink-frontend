// components/LogoutButton.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/useAuth";

export const LogoutButton = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <Button variant="outline" onClick={handleLogout}>
      Cerrar sesión
    </Button>
  );
};
