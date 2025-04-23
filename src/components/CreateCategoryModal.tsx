import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
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
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre es obligatorio" }),
  type: z.enum(["INCOME", "EXPENSE"], { message: "Seleccioná un tipo" }),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export const CreateCategoryModal = ({ open, onClose, onCreated }: Props) => {
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "EXPENSE",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://koink-backend-production.up.railway.app/api/categories",
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.reset();
      setErrorMsg("");
      onCreated?.();
      onClose();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message?.includes("already exists")) {
          setErrorMsg("Ya existe una categoría con ese nombre");
        } else {
          console.error("Error al crear categoría:", error);
          setErrorMsg("Hubo un error inesperado. Intentá nuevamente.");
        }
      } else {
        console.error("Error desconocido:", error);
        setErrorMsg("Ocurrió un error desconocido");
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <p className="text-sm text-red-500">{errorMsg}</p>
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
