import { RegisterForm } from "../features/auth/RegisterForm"

export const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Crear cuenta</h1>
        <RegisterForm />
      </div>
    </div>
  )
}
