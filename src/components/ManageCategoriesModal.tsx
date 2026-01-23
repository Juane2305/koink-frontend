import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Trash, AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
}

interface Props {
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

export const ManageCategoriesModal = ({ open, onClose, onChanged }: Props) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      fetchCategories();
      setErrorMsg("");
    }
  }, [open, fetchCategories]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setErrorMsg("");
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) {
        // Manejo de error de clave foránea (categoría en uso)
        if (error.code === "23503") {
          setErrorMsg(
            "No se puede eliminar la categoría porque tiene transacciones asociadas.",
          );
        } else {
          throw error;
        }
      } else {
        fetchCategories();
        onChanged?.();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setErrorMsg("Hubo un error al intentar eliminar la categoría.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestionar Categorías</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
            {loading && categories.length === 0 ? (
              <p className="text-center py-4 text-sm text-muted-foreground animate-pulse">
                Cargando categorías...
              </p>
            ) : categories.length === 0 ? (
              <p className="text-center py-4 text-sm text-muted-foreground">
                No tienes categorías creadas.
              </p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.type === "INCOME" ? "Ingreso" : "Egreso"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                  >
                    <Trash
                      className={`w-4 h-4 ${deletingId === cat.id ? "animate-pulse" : ""}`}
                    />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
