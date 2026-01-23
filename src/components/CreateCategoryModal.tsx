import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../lib/supabase"; // Usamos Supabase
import { useAuth } from "../hooks/useAuth"; // Necesitamos el usuario
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
import { useState, useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre es obligatorio" }),
  type: z.enum(["INCOME", "EXPENSE"], { message: "Seleccioná un tipo" }),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  defaultType?: "INCOME" | "EXPENSE";
}

export const CreateCategoryModal = ({
  open,
  onClose,
  onCreated,
  defaultType = "EXPENSE",
}: Props) => {
  const { user } = useAuth(); // Obtenemos el usuario actual
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: defaultType,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        type: defaultType,
      });
      setErrorMsg("");
    }
  }, [open, defaultType, form]);

  const onSubmit = async (values: FormValues) => {
    if (!user) return; // Seguridad extra

    setLoading(true);
    setErrorMsg("");

    try {
      // Insertamos directo en Supabase
      const { error } = await supabase.from("categories").insert({
        name: values.name,
        type: values.type,
        user_id: user.id, // Vinculamos la categoría al usuario
        icon: "Circle", // Icono por defecto (puedes cambiarlo luego)
        color: "#94a3b8", // Color gris por defecto
      });

      if (error) throw error;

      form.reset();
      onCreated?.(); // Avisamos que se creó para refrescar listas
      onClose();
    } catch (error: unknown) {
      console.error("Error al crear categoría:", error);
      // Manejo básico de duplicados (Postgres devuelve código 23505 para unique_violation)
      if (
        typeof error === "object" &&
        error !== null &&
        ("code" in error || "message" in error)
      ) {
        const err = error as { code?: string; message?: string };
        if (err.code === "23505" || err.message?.includes("duplicate")) {
          setErrorMsg("Ya existe una categoría con ese nombre.");
        } else {
          setErrorMsg("Hubo un error al guardar. Intentá nuevamente.");
        }
      } else {
        setErrorMsg("Hubo un error al guardar. Intentá nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nueva categoría</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Gimnasio, Regalos..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccioná tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INCOME">Ingreso</SelectItem>
                      <SelectItem value="EXPENSE">Egreso</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMsg && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
                {errorMsg}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando..." : "Crear categoría"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
