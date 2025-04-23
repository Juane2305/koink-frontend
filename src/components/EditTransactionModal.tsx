import { useEffect, useState } from "react";
import axios from "axios";
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
  id: number;
  name: string;
  type: TransactionType;
}

interface TransactionToEdit {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categoryId: number | null;
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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [date, setDate] = useState<Date>(new Date(transaction.date));
  const [showCategorySelect, setShowCategorySelect] = useState(
    transaction.categoryId == null
  );
  const [categoryError, setCategoryError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://koink-backend-production.up.railway.app/api/categories",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCategories(response.data);

        const current = response.data.find(
          (cat: Category) => cat.id === transaction.categoryId
        );
        if (current) setSelectedCategory(current);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    if (open) fetchCategories();
  }, [open, transaction.categoryId]);

  useEffect(() => {
    if (selectedCategory && selectedCategory.type !== type) {
      setSelectedCategory(null);
      setShowCategorySelect(true);
    }
  }, [type]);

  const handleSubmit = async () => {
    setLoading(true);
    if (!selectedCategory) {
      setCategoryError("Debes seleccionar una categoría.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://koink-backend-production.up.railway.app/api/transactions/${transaction.id}`,
        {
          description,
          amount,
          categoryId: selectedCategory.id,
          type,
          date: date.toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.dispatchEvent(new Event("transaction-updated"));
      onClose();
    } catch (error) {
      console.error("Error updating transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    description.trim() !== "" && amount > 0 && selectedCategory !== null && !!date;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby="dialog-desc">
        <DialogHeader>
          <DialogTitle>Editar transacción</DialogTitle>
        </DialogHeader>
        <p id="dialog-desc" className="sr-only">
          Formulario para editar una transacción existente. Incluye tipo, monto,
          fecha y categoría.
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
              type="number"
              value={amount}
              onChange={(e) =>
                setAmount(Math.max(0, parseFloat(e.target.value)))
              }
              placeholder="$0.00"
            />
          </div>

          <div className="space-y-1">
            <Label>Categoría</Label>
            {!showCategorySelect && selectedCategory ? (
              <div className="flex justify-between items-center p-2 border rounded-md bg-gray-50">
                <span>{selectedCategory.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCategorySelect(true)}
                >
                  Cambiar
                </Button>
              </div>
            ) : (
              <>
                <Select
                  value={selectedCategory?.id.toString() || ""}
                  onValueChange={(val) => {
                    const found = categories.find(
                      (cat) => cat.id === Number(val)
                    );
                    setSelectedCategory(found || null);
                    setCategoryError("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((cat) => cat.type === type)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {categoryError && (
                  <p className="text-sm text-red-500 mt-1">{categoryError}</p>
                )}
              </>
            )}
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
