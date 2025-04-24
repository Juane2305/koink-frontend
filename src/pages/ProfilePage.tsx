import { useEffect, useState } from "react";
import api from "../lib/api";
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
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        "/api/user/me",
        {
          name: user.name,
          currency: user.currency,
          alertsByEmail: user.alertsByEmail,
          avatar: user.avatar,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("Error updating user profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Cargando perfil...</p>;
  }

  if (!user) {
    return <p className="text-center mt-10 text-red-500">Error al cargar el perfil</p>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <Card>
        <CardHeader className="flex flex-col items-center space-y-4">
          <img
            src={user.avatar || "/avatars/default-avatar.png"}
            alt={user.name}
            className="w-24 h-24 rounded-full border shadow cursor-pointer"
            onClick={() => setShowAvatarModal(true)}
          />
          <CardTitle>Tu perfil</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input value={user.email} disabled className="bg-gray-100" />
          </div>

          <div>
            <Label>Moneda</Label>
            <Select
              value={user.currency}
              onValueChange={(value) => setUser({ ...user, currency: value })}
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

          <div className="flex items-center gap-3">
            <Switch
              id="alerts"
              checked={user.alertsByEmail}
              onCheckedChange={(checked) =>
                setUser({ ...user, alertsByEmail: checked })
              }
            />
            <Label htmlFor="alerts">Recibir alertas por correo</Label>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elegí un nuevo avatar</DialogTitle>
          </DialogHeader>
          <SelectAvatar
            value={user.avatar}
            onChange={(url) => setUser({ ...user, avatar: url })}
            onClose={() => setShowAvatarModal(false)}
          />
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => setUser({ ...user, avatar: "/avatars/default-avatar.png" })}
          >
            Eliminar avatar y usar predeterminado
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};