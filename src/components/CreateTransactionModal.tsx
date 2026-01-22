import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // Importamos Supabase
import { useAuth } from "../hooks/useAuth"; // Necesitamos el usuario actual
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
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
import { Loader2 } from "lucide-react";

type TransactionType = "INCOME" | "EXPENSE";

interface Category {
  id: string; // Cambio importante: Supabase usa UUIDs (strings), no números
  name: string;
  type: TransactionType;
}

interface CreateTransactionModalProps {
  open: boolean;
  onClose: () => void;
  typeSelected: TransactionType;
}

export const CreateTransactionModal = ({
  open,
  onClose,
  typeSelected,
}: CreateTransactionModalProps) => {
  const { user } = useAuth(); // Obtenemos el usuario para asignarle la transacción
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState<string | null>(null); // ID ahora es string
  const [type, setType] = useState<TransactionType>(typeSelected);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);

  // Cargar categorías desde Supabase
  const fetchCategories = async () => {
    try {
      // Supabase aplicará las políticas de seguridad (RLS) automáticamente:
      // Solo traerá las categorías del sistema (user_id null) y las de este usuario.
      const { data, error } = await supabase
        .from("categories")
        .select("*");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const handleSubmit = async () => {
    if (!categoryId || !date || amount <= 0 || !user) return;
    
    setLoading(true);
    // Formato de fecha para PostgreSQL (ISO 8601 simple)
    const formattedDate = date.toISOString();

    try {
      // Insertar directo en la tabla 'transactions'
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,     // Vinculamos la transacción al usuario actual
        description: description,
        amount: amount,
        category_id: categoryId,
        type: type,
        date: formattedDate,
      });

      if (error) throw error;

      // Avisar a la app que hay datos nuevos (para actualizar el Dashboard)
      window.dispatchEvent(new Event("transaction-created"));

      // Limpiar formulario y cerrar
      onClose();
      setDescription("");
      setAmount(0);
      setCategoryId(null);
      setType("EXPENSE");
      setDate(new Date());
    } catch (error) {
      console.error("Error creando transacción:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setType(typeSelected);
      fetchCategories();
    }
  }, [open, typeSelected]);

  const isFormValid =
    description.trim() !== "" && amount > 0 && categoryId !== null && !!date;

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
              onValueChange={(val) => {
                setType(val as TransactionType);
                setCategoryId(null); // Resetear categoría al cambiar el tipo
              }}
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
                // Tu lógica original para formatear el input de dinero
                const raw = e.target.value.replace(/\./g, ""); // Eliminar puntos de miles
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
              value={categoryId || ""}
              onValueChange={(val) => setCategoryId(val)}
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

          <div className="space-y-1 flex justify-start mb-5">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                if (selectedDate) setDate(selectedDate);
              }}
              disabled={(day) => day > new Date()}
              className="rounded-md border"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={loading || !isFormValid}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};