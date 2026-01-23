import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch"; // Importamos el Switch
import { Calendar } from "../../components/ui/calendar";
import { Loader2, AlertCircle } from "lucide-react";
import { BudgetPeriod, Budget } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: Budget;
}

interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
}

export const BudgetModal = ({ open, onClose, initialData }: Props) => {
  const { user } = useAuth();
  const isEdit = !!initialData;
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [limitAmount, setLimitAmount] = useState(0);
  const [period, setPeriod] = useState<BudgetPeriod>("MONTHLY");
  const [startDate, setStartDate] = useState<Date>(new Date());

  // Nuevo estado para la auto-renovación
  const [autoRenew, setAutoRenew] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      // Traemos todas las categorías para asegurar que encontramos la del presupuesto
      const { data, error } = await supabase.from("categories").select("*");

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error al obtener categorías:", err);
    }
  };

  useEffect(() => {
    if (open) {
      setErrorMessage(null);
      fetchCategories();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        const rawId =
          initialData.categoryId ?? (initialData as any).category_id;
        const normalizedId = rawId ? String(rawId) : null;

        if (normalizedId) setCategoryId(normalizedId);

        setLimitAmount(initialData.limitAmount);
        setPeriod(initialData.period);
        setStartDate(
          initialData.startDate ? new Date(initialData.startDate) : new Date(),
        );
        setAutoRenew(initialData.autoRenew || false);
      } else {
        setCategoryId(null);
        setLimitAmount(0);
        setPeriod("MONTHLY");
        setStartDate(new Date());
        setAutoRenew(false);
      }
    }
  }, [open, initialData, categories.length]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setErrorMessage(null);

    if (!user) return;
    if (!categoryId) {
      setErrorMessage("Debes seleccionar una categoría.");
      return;
    }
    if (limitAmount <= 0) {
      setErrorMessage("El monto límite debe ser mayor a 0.");
      return;
    }

    setLoading(true);

    const payload = {
      user_id: user.id,
      category_id: categoryId,
      limit_amount: limitAmount,
      period: period,
      start_date: startDate.toISOString(),
      auto_renew: autoRenew, // Enviamos el nuevo campo
    };

    try {
      if (isEdit && initialData) {
        const { error } = await supabase
          .from("budgets")
          .update(payload)
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("budgets").insert(payload);
        if (error) throw error;
      }

      window.dispatchEvent(new Event("budget-updated"));
      onClose();
    } catch (err: unknown) {
      console.error("❌ Error al guardar:", err);
      if (typeof err === "object" && err !== null && "code" in err) {
        if ((err as { code?: string }).code === "23505") {
          setErrorMessage("Ya tienes un presupuesto para esta categoría.");
        } else {
          setErrorMessage("Ocurrió un error al intentar guardar.");
        }
      } else {
        setErrorMessage("Ocurrió un error al intentar guardar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "Editar presupuesto" : "Nuevo presupuesto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Categoría</Label>
            <Select
              key={categories.length > 0 ? "loaded" : "loading"}
              value={categoryId || ""}
              onValueChange={(val) => setCategoryId(val)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Monto límite</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                $
              </span>
              <Input
                type="text"
                inputMode="numeric"
                className="pl-7 h-11 text-lg font-medium"
                value={limitAmount ? limitAmount.toLocaleString("es-AR") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setLimitAmount(Number(raw) || 0);
                }}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Período</Label>
            <Select
              value={period}
              onValueChange={(val) => setPeriod(val as BudgetPeriod)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Diario</SelectItem>
                <SelectItem value="WEEKLY">Semanal</SelectItem>
                <SelectItem value="MONTHLY">Mensual</SelectItem>
                <SelectItem value="ANNUAL">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Fecha de inicio</Label>
            <div className="flex justify-center border rounded-lg p-2 bg-slate-50">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                className="rounded-md"
              />
            </div>
          </div>

          {/* Switch de Auto-renovación */}
          <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-white">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">Auto-renovación</Label>
              <p className="text-xs text-muted-foreground">
                Reiniciar el presupuesto automáticamente.
              </p>
            </div>
            <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
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
                "Crear presupuesto"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
