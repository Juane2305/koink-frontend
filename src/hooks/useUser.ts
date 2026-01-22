import { useAuth } from "./useAuth";

export const useUser = () => {
  const { user } = useAuth();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    // Supabase guarda los datos extra en user_metadata
    name: user.user_metadata?.full_name || "Usuario",
    avatar: user.user_metadata?.avatar_url,
    currency: user.user_metadata?.currency || "ARS",
  };
};