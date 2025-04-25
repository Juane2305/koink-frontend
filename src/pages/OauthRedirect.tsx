import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const OauthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const newUser = urlParams.get("new") === "true";

    if (token) {
      localStorage.setItem("token", token);

      setTimeout(() => {
        if (newUser) {
          navigate("/welcome");
        } else {
          navigate("/dashboard");
        }
      }, 1000);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg font-semibold animate-pulse">Redirigiendo...</p>
    </div>
  );
};