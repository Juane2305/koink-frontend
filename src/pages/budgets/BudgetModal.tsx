import { useEffect, useState } from "react";
import api from "../../lib/api";
import axios from "axios";
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
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
}

export const BudgetModal = ({ open, onClose, initialData }: Props) => {
  const isEdit = !!initialData;
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [limitAmount, setLimitAmount] = useState(0);
  const [period, setPeriod] = useState<BudgetPeriod>("MONTHLY");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(
        "/api/categories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategories(res.data);
    } catch (err) {
      console.error("Error al obtener categorías:", err);
    }
  };

  useEffect(() => {
    setErrorMessage(null);

    if (open) {
      fetchCategories();

      if (initialData) {
        setCategoryId(initialData.categoryId);
        setLimitAmount(initialData.limitAmount);
        setPeriod(initialData.period);
        setStartDate(new Date(initialData.startDate));
      } else {
        setCategoryId(null);
        setLimitAmount(0);
        setPeriod("MONTHLY");
        setStartDate(new Date());
      }
    }
  }, [open, initialData]);

  const createBudget = async () => {
    const token = localStorage.getItem("token");
    const payload = {
      categoryId,
      limitAmount,
      period,
      startDate: startDate.toISOString().split("T")[0],
    };

    await api.post(
      "/api/budgets",
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  const updateBudget = async () => {
    const token = localStorage.getItem("token");
    const payload = {
      categoryId,
      limitAmount,
      period,
      startDate: startDate.toISOString().split("T")[0],
    };

    await api.put(
      `/api/budgets/${
        initialData!.id
      }`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  const handleSubmit = async () => {
    if (
      !categoryId ||
      isNaN(limitAmount) ||
      limitAmount <= 0 ||
      !period ||
      !startDate
    )
      return;
    setLoading(true);
    setErrorMessage(null);

    try {
      if (initialData) {
        await updateBudget();
      } else {
        await createBudget();
      }

      window.dispatchEvent(new Event("budget-updated"));
      onClose();
    } catch (err: unknown) {
      console.error("❌ Error al guardar presupuesto:", err);

      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setErrorMessage(
          err.response.data.message || "No se pudo guardar el presupuesto."
        );
      } else {
        setErrorMessage("Ocurrió un error inesperado.");
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
              value={categoryId?.toString() || ""}
              onValueChange={(val) => setCategoryId(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
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
              disabled={(day) => day > new Date()}
              className="rounded-md border"
            />
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
          )}

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
