import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useCurrency } from "../../context/CurrencyContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Calendar } from "../../components/ui/calendar";
import { Loader2, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { Goal } from "../../types/goals";

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: Goal;
}

export const GoalModal = ({ open, onClose, initialData }: Props) => {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const isEdit = !!initialData;

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // ... (rest of effect)
  }, [open, initialData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!user) return;
    if (!name.trim()) {
      setErrorMessage("Debes ingresar un nombre para la meta.");
      return;
    }
    if (targetAmount <= 0) {
      setErrorMessage("El monto objetivo debe ser mayor a 0.");
      return;
    }

    setLoading(true);

    const payload = {
      user_id: user.id,
      name: name.trim(),
      target_amount: targetAmount,
      current_amount: isEdit && initialData ? initialData.current_amount : 0,
      deadline: deadline ? deadline.toISOString() : null,
      currency: isEdit && initialData ? initialData.currency : currency, // Si es nuevo usamos la moneda actual del contexto
    };

    try {
      if (isEdit && initialData) {
        const { error } = await supabase
          .from("goals")
          .update(payload)
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("goals").insert(payload);
        if (error) throw error;
      }

      onClose();
    } catch (err) {
      console.error("Error al guardar meta:", err);
      setErrorMessage("Ocurrió un error al intentar guardar la meta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "Editar meta" : "Nueva meta de ahorro"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Nombre de la meta</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Fondo de emergencia, Viaje, etc."
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Monto objetivo</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                $
              </span>
              <Input
                type="text"
                inputMode="numeric"
                className="pl-7 h-11 text-lg font-medium"
                value={targetAmount ? targetAmount.toLocaleString("es-AR") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setTargetAmount(Number(raw) || 0);
                }}
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-slate-500" />
              Fecha objetivo (Opcional)
            </Label>
            <div className="flex justify-center border rounded-lg p-2 bg-slate-50">
              <Calendar
                mode="single"
                selected={deadline}
                onSelect={setDeadline}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                className="rounded-md"
              />
            </div>
            {deadline && (
              <p className="text-[10px] text-indigo-600 font-medium text-center">
                Seleccionado: {deadline.toLocaleDateString("es-AR")}
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              <AlertCircle className="h-4 w-4" />
              {errorMessage}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-[2] h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isEdit ? (
                "Guardar cambios"
              ) : (
                "Crear meta"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
