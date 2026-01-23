import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { useState, useEffect } from "react";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { ScheduledPayment } from "../pages/pending/PendingPaymentsPage";
import { useCurrency } from "../context/CurrencyContext"; // Import currency hook

const formSchema = z.object({
  description: z.string().min(2, { message: "La descripción es obligatoria" }),
  amount: z.string().min(1, { message: "El monto es obligatorio" }),
  due_date: z.string().min(1, { message: "La fecha es obligatoria" }),
  category_id: z.string(),
  recurring: z.boolean(),
  frequency: z.string(),
  currency: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingPayment?: ScheduledPayment | null;
}

export const ScheduledPaymentModal = ({
  open,
  onClose,
  onSaved,
  editingPayment,
}: Props) => {
  const { user } = useAuth();
  const { currency } = useCurrency(); // Get current currency
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      due_date: "",
      category_id: "",
      recurring: false,
      frequency: "MONTHLY",
      currency: currency, // Default to current currency
    },
  });

  const fetchCategories = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("type", "EXPENSE")
      .order("name");
    setCategories(data || []);
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  useEffect(() => {
    if (editingPayment) {
      form.reset({
        description: editingPayment.description,
        amount: editingPayment.amount.toString(),
        due_date: editingPayment.due_date,
        category_id: editingPayment.category_id || "",
        recurring: editingPayment.recurring,
        frequency: editingPayment.frequency,
        currency: editingPayment.currency || "ARS",
      });
    } else {
      form.reset({
        description: "",
        amount: "",
        due_date: "",
        category_id: "",
        recurring: false,
        frequency: "MONTHLY",
        currency: currency, // Reset to current currency
      });
    }
  }, [editingPayment, form, currency]);

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    setLoading(true);

    try {
      const payload = {
        user_id: user.id,
        description: values.description,
        amount: parseFloat(values.amount),
        due_date: values.due_date,
        category_id: values.category_id || null,
        recurring: values.recurring,
        frequency: values.frequency,
        currency: values.currency,
      };

      if (editingPayment) {
        const { error } = await supabase
          .from("scheduled_payments")
          .update(payload)
          .eq("id", editingPayment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("scheduled_payments")
          .insert(payload);
        if (error) throw error;
      }

      onSaved();
    } catch (error) {
      console.error("Error saving scheduled payment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingPayment
              ? "Editar Gasto Pendiente"
              : "Agendar Gasto Pendiente"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Alquiler, Internet..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccioná la moneda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ARS">🇦🇷 Pesos (ARS)</SelectItem>
                      <SelectItem value="USD">🇺🇸 Dólares (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="$0.00"
                        value={
                          field.value
                            ? `${form.getValues("currency") === "USD" ? "U$S " : "$ "}${parseFloat(field.value).toLocaleString("es-AR")}`
                            : ""
                        }
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          // Remove leading zeros if parsing
                          const val = raw ? parseInt(raw, 10) : "";
                          field.onChange(val.toString());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de pago</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      if (val === "new-category") {
                        setShowCreateCategory(true);
                      } else {
                        field.onChange(val);
                      }
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccioná una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem
                        value="new-category"
                        className="text-indigo-600 font-medium focus:text-indigo-700 bg-indigo-50 focus:bg-indigo-100 cursor-pointer"
                      >
                        + Nueva categoría
                      </SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-medium">
                  ¿Es recurrente?
                </FormLabel>
                <p className="text-[10px] text-muted-foreground">
                  Se renovará automáticamente todos los meses.
                </p>
              </div>
              <FormField
                control={form.control}
                name="recurring"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
      {showCreateCategory && (
        <CreateCategoryModal
          open={showCreateCategory}
          onClose={() => setShowCreateCategory(false)}
          defaultType="EXPENSE"
          onCreated={() => {
            // Re-fetch categories
            const fetchCategories = async () => {
              if (!user) return;
              const { data } = await supabase
                .from("categories")
                .select("id, name")
                .eq("user_id", user.id)
                .eq("type", "EXPENSE")
                .order("name");
              setCategories(data || []);
            };
            fetchCategories();
            setShowCreateCategory(false);
          }}
        />
      )}
    </Dialog>
  );
};
