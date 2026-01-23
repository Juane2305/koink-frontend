import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase"; // Usamos Supabase
import { useAuth } from "../../hooks/useAuth"; // Necesitamos el usuario
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
import { Calendar } from "../../components/ui/calendar";
import { Loader2 } from "lucide-react";
import { BudgetPeriod, Budget } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: Budget;
}

interface Category {
  id: string; // UUID es string
  name: string;
  type: "INCOME" | "EXPENSE";
}

export const BudgetModal = ({ open, onClose, initialData }: Props) => {
  const { user } = useAuth(); // Obtenemos usuario autenticado
  const isEdit = !!initialData;
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null); // UUID string
  const [limitAmount, setLimitAmount] = useState(0);
  const [period, setPeriod] = useState<BudgetPeriod>("MONTHLY");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cargar categorías (filtradas por el usuario automáticamente por RLS)
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("type", "EXPENSE"); // Generalmente se presupuestan gastos

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error al obtener categorías:", err);
    }
  };

  useEffect(() => {
    setErrorMessage(null);

    if (open) {
      fetchCategories();

      if (initialData) {
        setCategoryId(String(initialData.categoryId)); // Convertimos a string para evitar error de tipo
        setLimitAmount(initialData.limitAmount);
        setPeriod(initialData.period);
        // Manejo seguro de la fecha
        setStartDate(
          initialData.startDate ? new Date(initialData.startDate) : new Date(),
        );
      } else {
        setCategoryId(null);
        setLimitAmount(0);
        setPeriod("MONTHLY");
        setStartDate(new Date());
      }
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    if (
      !user ||
      !categoryId ||
      isNaN(limitAmount) ||
      limitAmount <= 0 ||
      !period ||
      !startDate
    )
      return;

    setLoading(true);
    setErrorMessage(null);

    // Mapeamos los datos para Supabase (snake_case)
    const payload = {
      user_id: user.id,
      category_id: categoryId,
      limit_amount: limitAmount,
      period: period,
      start_date: startDate.toISOString(),
    };

    try {
      if (initialData) {
        // ACTUALIZAR (UPDATE)
        const { error } = await supabase
          .from("budgets")
          .update(payload)
          .eq("id", initialData.id); // UUID del presupuesto

        if (error) throw error;
      } else {
        // CREAR (INSERT)
        const { error } = await supabase.from("budgets").insert(payload);

        if (error) throw error;
      }

      // Disparar evento para recargar la lista de presupuestos
      window.dispatchEvent(new Event("budget-updated"));
      onClose();
    } catch (err: unknown) {
      console.error("❌ Error al guardar presupuesto:", err);

      // Manejo de errores comunes de base de datos
      if (
        typeof err === "object" &&
        err !== null &&
        ("message" in err || "code" in err)
      ) {
        const errorObj = err as { message?: string; code?: string };
        if (
          errorObj.message?.includes("duplicate") ||
          errorObj.code === "23505"
        ) {
          setErrorMessage("Ya existe un presupuesto para esta categoría.");
        } else {
          setErrorMessage("No se pudo guardar. Intenta nuevamente.");
        }
      } else {
        setErrorMessage("No se pudo guardar. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar presupuesto" : "Nuevo presupuesto"}
          </DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          // Agregamos esto para evitar el GET /budgets?
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
        >
          <div className="flex flex-col gap-3">
            <Label>Categoría</Label>
            <Select
              value={categoryId || ""}
              onValueChange={(val) => setCategoryId(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3">
            <Label>Monto límite</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={
                limitAmount ? `$${limitAmount.toLocaleString("es-AR")}` : ""
              }
              onChange={(e) => {
                const raw = e.target.value
                  .replace(/\./g, "")
                  .replace(/\$/g, "")
                  .replace(/\D/g, "");
                const parsed = parseFloat(raw);
                if (!isNaN(parsed)) {
                  setLimitAmount(parsed);
                } else {
                  setLimitAmount(0);
                }
              }}
              placeholder="$0.00"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label>Período</Label>
            <Select
              value={period}
              onValueChange={(val) => setPeriod(val as BudgetPeriod)}
            >
              <SelectTrigger>
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

          <div className="flex flex-col items-start gap-3">
            <Label>Fecha de inicio</Label>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && setStartDate(date)}
              // Permitimos fechas futuras o pasadas según la lógica que prefieras
              className="rounded-md border"
            />
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
          )}

          <Button
            type="button" // <--- Importante: evita que el botón actúe como submit nativo
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading
              ? "Guardando..."
              : isEdit
                ? "Guardar cambios"
                : "Crear presupuesto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
