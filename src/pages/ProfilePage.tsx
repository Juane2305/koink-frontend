import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // Importamos Supabase
import { useAuth } from "../hooks/useAuth"; // Usamos nuestro hook de auth
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { SelectAvatar } from "../components/SelectAvatar";

interface UserData {
  name: string;
  email: string;
  currency: string;
  alertsByEmail: boolean;
  avatar: string;
}

export const ProfilePage = () => {
  const { user: authUser } = useAuth(); // Obtenemos el usuario de la sesión
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authUser) return;

      try {
        setLoading(true);
        // Traemos los datos de la tabla 'profiles'
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (error) throw error;

        if (data) {
          setUserData({
            name: data.full_name || "",
            email: data.email || "",
            currency: data.currency || "ARS",
            alertsByEmail: data.alerts_by_email || false,
            avatar: data.avatar_url || "/avatars/default-avatar.png",
          });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  const handleSave = async () => {
    if (!userData || !authUser) return;
    setSaving(true);
    
    try {
      // 1. Actualizar la tabla 'profiles'
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: userData.name,
          currency: userData.currency,
          alerts_by_email: userData.alertsByEmail,
          avatar_url: userData.avatar,
        })
        .eq("id", authUser.id);

      if (profileError) throw profileError;

      // 2. Opcional: También actualizamos la metadata de la sesión 
      // para que el nombre cambie en el Dashboard sin recargar
      await supabase.auth.updateUser({
        data: { 
          full_name: userData.name,
          avatar_url: userData.avatar 
        }
      });

      alert("¡Perfil actualizado con éxito!");
    } catch (err) {
      console.error("Error updating user profile:", err);
      alert("Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">
      <p className="text-gray-500 animate-pulse">Cargando perfil...</p>
    </div>;
  }

  if (!userData) {
    return <p className="text-center mt-10 text-red-500">Error al cargar el perfil</p>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <Card>
        <CardHeader className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg cursor-pointer transition hover:brightness-90"
              onClick={() => setShowAvatarModal(true)}
            />
            <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full text-xs">
              ✎
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{userData.name}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Email (No se puede cambiar)</Label>
            <Input value={userData.email} disabled className="bg-gray-50 text-gray-400" />
          </div>

          <div className="space-y-2">
            <Label>Moneda de preferencia</Label>
            <Select
              value={userData.currency}
              onValueChange={(value) => setUserData({ ...userData, currency: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARS">Peso argentino (ARS)</SelectItem>
                <SelectItem value="USD">Dólar estadounidense (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="alerts">Alertas por correo</Label>
              <p className="text-xs text-muted-foreground">Te avisaremos cuando superes un presupuesto.</p>
            </div>
            <Switch
              id="alerts"
              checked={userData.alertsByEmail}
              onCheckedChange={(checked) =>
                setUserData({ ...userData, alertsByEmail: checked })
              }
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full h-12 text-lg">
            {saving && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Elegí tu avatar</DialogTitle>
          </DialogHeader>
          <SelectAvatar
            value={userData.avatar}
            onChange={(url) => setUserData({ ...userData, avatar: url })}
            onClose={() => setShowAvatarModal(false)}
          />
          <Button
            variant="ghost"
            className="w-full mt-2 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => {
              setUserData({ ...userData, avatar: "/avatars/default-avatar.png" });
              setShowAvatarModal(false);
            }}
          >
            Quitar avatar actual
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};