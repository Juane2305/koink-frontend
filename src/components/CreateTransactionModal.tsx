import { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";

type TransactionType = "INCOME" | "EXPENSE";

interface Category {
  id: number;
  name: string;
  type: TransactionType;
}

interface CreateTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateTransactionModal = ({
  open,
  onClose,
}: CreateTransactionModalProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async () => {
    if (!categoryId || !date || amount <= 0) return;
    const formattedDate = date.toISOString().split("T")[0];
    console.log(formattedDate);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8080/api/transactions",
        {
          description,
          amount,
          categoryId,
          type,
          date: formattedDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Emitimos evento global
      window.dispatchEvent(new Event("transaction-created"));

      // Limpiar y cerrar
      onClose();
      setDescription("");
      setAmount(0);
      setCategoryId(null);
      setType("EXPENSE");
      setDate(new Date());
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };

  useEffect(() => {
    if (open) fetchCategories();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar transacción</DialogTitle>
        </DialogHeader>

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
              placeholder="Ej: Sueldo, salida, etc."
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
                if (!isNaN(parsed)) {
                  setAmount(parsed);
                } else {
                  setAmount(0);
                }
              }}
              placeholder="$0.00"
            />
          </div>

          <div className="space-y-1">
            <Label>Categoría</Label>
            <Select
              value={categoryId?.toString()}
              onValueChange={(val) => setCategoryId(Number(val))}
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
          </div>

          <div className="space-y-1 flex justify-start mb-5">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
              disabled={(day) => day > new Date()}
              className="rounded-md border"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
