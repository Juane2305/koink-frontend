import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // Importamos Supabase
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Calendar } from "../components/ui/calendar";
import { Loader2 } from "lucide-react";

export type TransactionType = "INCOME" | "EXPENSE";

interface Category {
  id: string; // UUID es string
  name: string;
  type: TransactionType;
}

interface TransactionToEdit {
  id: string; // UUID es string
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category_id?: string; // Nombre de columna en Supabase
  categoryName?: string;
}

interface EditTransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction: TransactionToEdit;
}

export const EditTransactionModal = ({
  open,
  onClose,
  transaction,
}: EditTransactionModalProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(transaction.amount);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    transaction.category_id || null
  );
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [date, setDate] = useState<Date>(new Date(transaction.date));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*");
        
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    if (open) fetchCategories();
  }, [open]);

  // Si cambia el tipo (Ingreso/Egreso), reseteamos la categoría seleccionada
  useEffect(() => {
    const currentCategory = categories.find(c => c.id === selectedCategoryId);
    if (currentCategory && currentCategory.type !== type) {
      setSelectedCategoryId(null);
    }
  }, [type, categories, selectedCategoryId]);

  const handleSubmit = async () => {
    if (!selectedCategoryId || amount <= 0 || description.trim() === "") return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from("transactions")
        .update({
          description,
          amount,
          category_id: selectedCategoryId,
          type,
          date: date.toISOString(),
        })
        .eq("id", transaction.id);

      if (error) throw error;

      // Avisar a la app que se actualizó una transacción
      window.dispatchEvent(new Event("transaction-updated"));
      onClose();
    } catch (error) {
      console.error("Error updating transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    description.trim() !== "" && amount > 0 && selectedCategoryId !== null && !!date;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby="dialog-desc">
        <DialogHeader>
          <DialogTitle>Editar transacción</DialogTitle>
        </DialogHeader>
        <p id="dialog-desc" className="sr-only">
          Formulario para editar una transacción existente.
        </p>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Tipo</Label>
            <Select
              value={type}
              onValueChange={(val) => setType(val as TransactionType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Ingreso</SelectItem>
                <SelectItem value="EXPENSE">Egreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Descripción</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Monto</Label>
            <Input
              type="text"
              value={amount === 0 ? "" : amount.toLocaleString("es-AR")}
              onChange={(e) => {
                const raw = e.target.value.replace(/\./g, "");
                const parsed = parseFloat(raw);
                setAmount(isNaN(parsed) ? 0 : parsed);
              }}
              placeholder="$0.00"
            />
          </div>

          <div className="space-y-1">
            <Label>Categoría</Label>
            <Select
              value={selectedCategoryId || ""}
              onValueChange={(val) => setSelectedCategoryId(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((cat) => cat.type === type)
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Fecha</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
              disabled={(day) => day > new Date()}
              className="rounded-md border"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={loading || !isFormValid}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};