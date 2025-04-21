import { LoginForm } from "../components/LoginForm";

export const LoginPage = () => {

 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
        <LoginForm/>
    </div>
  );
};
