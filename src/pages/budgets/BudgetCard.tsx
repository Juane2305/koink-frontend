import { Budget } from "./types";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { BudgetModal } from "./BudgetModal";
import { supabase } from "../../lib/supabase"; // Importamos Supabase
import { Badge } from "../../components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    timeZone: 'UTC' // Usamos UTC para que coincida con lo guardado en la BD
  });

const periodMap: Record<Budget["period"], string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  ANNUAL: "Anual",
};

interface Props {
  budget: Budget;
  onRefresh: () => void;
}

export const BudgetCard = ({ budget, onRefresh }: Props) => {
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Borrado directo en Supabase usando el ID (UUID)
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", budget.id);

      if (error) throw error;

      onRefresh(); // Recargamos la lista
    } catch (err) {
      console.error("Error al eliminar presupuesto:", err);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const percentage =
    budget.limitAmount > 0
      ? Math.min((budget.spentAmount / budget.limitAmount) * 100, 100)
      : 0;

  const getColorClass = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-400"; // Alerta al 80%
    return "bg-green-600";
  };

  const colorClass = getColorClass(percentage);
  const excedido = budget.spentAmount > budget.limitAmount;

  return (
    <div className="border rounded-lg p-4 shadow-sm space-y-4 bg-white">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-bold text-black">{budget.categoryName}</span>
            <span className="opacity-70">• {periodMap[budget.period]}</span>
            <span className="opacity-70">
              {formatDate(budget.startDate)} al {formatDate(budget.endDate)}
            </span>
          </div>

          <h2 className="text-lg font-semibold">
            ${budget.spentAmount.toLocaleString("es-AR")} 
            <span className="text-gray-400 font-normal"> / ${budget.limitAmount.toLocaleString("es-AR")}</span>
            {excedido && <Badge variant="destructive" className="ml-2 animate-pulse">🔥 Excedido</Badge>}
          </h2>
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setShowEdit(true)} className="hover:bg-blue-50">
            <Pencil className="h-4 w-4 text-blue-600" />
          </Button>

          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-red-50">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará el presupuesto de <strong>{budget.categoryName}</strong> de forma permanente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
                  {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="space-y-1">
        <Progress value={percentage} className="h-2 bg-gray-100" indicatorClassName={colorClass} />
        <p className="text-[10px] text-right text-muted-foreground">
          {percentage.toFixed(0)}% del límite alcanzado
        </p>
      </div>

      <BudgetModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        initialData={budget}
      />
    </div>
  );
};