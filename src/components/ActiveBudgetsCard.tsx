import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // Usamos Supabase
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";

// Interface actualizada para Supabase
interface ActiveBudget {
  id: string; // UUID es string
  categoryName: string;
  limitAmount: number;
  spentAmount: number; // Lo calcularemos nosotros
  period: string;
  startDate: string;
  endDate: string;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });

const periodMap: Record<string, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  ANNUAL: "Anual",
};

// Función auxiliar para calcular fechas de inicio y fin según el periodo
const getPeriodDates = (period: string, budgetStartDate: string) => {
  const start = new Date(budgetStartDate);
  const end = new Date(start);

  if (period === "DAILY") {
    end.setHours(23, 59, 59, 999);
  } else if (period === "WEEKLY") {
    end.setDate(start.getDate() + 7);
    end.setHours(23, 59, 59, 999);
  } else if (period === "MONTHLY") {
    // Sumamos exactamente un mes a la fecha elegida
    end.setMonth(start.getMonth() + 1);
    end.setMilliseconds(end.getMilliseconds() - 1);
  } else if (period === "ANNUAL") {
    end.setFullYear(start.getFullYear() + 1);
    end.setMilliseconds(end.getMilliseconds() - 1);
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

export const ActiveBudgetsCard = () => {
  const [budgets, setBudgets] = useState<ActiveBudget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);

        // 1. Traemos los presupuestos definidos
        const { data: budgetsData, error } = await supabase
          .from("budgets")
          .select("*, categories(name)");

        if (error) throw error;
        if (!budgetsData) return;

        // 2. Para cada presupuesto, calculamos cuánto se ha gastado
        const budgetsWithUsage = await Promise.all(
          budgetsData.map(async (b) => {
            // 2. Pasá la fecha de inicio guardada en el presupuesto (b.start_date)
            const { start, end } = getPeriodDates(b.period, b.start_date);

            const { data: transactions } = await supabase
              .from("transactions")
              .select("amount")
              .eq("category_id", b.category_id)
              .eq("type", "EXPENSE")
              .gte("date", start)
              .lte("date", end);

            // Calculamos el total gastado
            const totalSpent =
              transactions?.reduce(
                (acc, curr) => acc + Number(curr.amount),
                0,
              ) || 0;

            return {
              id: b.id,
              categoryName: b.categories?.name || "Sin Nombre",
              limitAmount: b.limit_amount,
              spentAmount: totalSpent,
              period: b.period,
              startDate: start,
              endDate: end,
            };
          }),
        );

        setBudgets(budgetsWithUsage);
      } catch (error) {
        console.error("Error cargando presupuestos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();

    // Escuchamos si se crea una transacción para recalcular las barras de progreso
    const handleUpdate = () => fetchBudgets();
    window.addEventListener("transaction-created", handleUpdate);
    return () =>
      window.removeEventListener("transaction-created", handleUpdate);
  }, []);

  const getColorClass = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-400"; // Ajusté un poco el warning al 80%
    return "bg-green-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Presupuestos activos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
          {loading ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 animate-pulse">
                Calculando presupuestos...
              </p>
            </div>
          ) : budgets.length === 0 ? (
            <p className="text-sm text-gray-500">
              No tienes presupuestos activos. ¡Crea uno para controlar tus
              gastos!
            </p>
          ) : (
            budgets.map((b) => {
              const percentage = Math.min(
                (b.spentAmount / b.limitAmount) * 100,
                100,
              );
              const colorClass = getColorClass(percentage);
              const excedido = b.spentAmount > b.limitAmount;
              const periodo = periodMap[b.period] || b.period;

              return (
                <div
                  key={b.id}
                  className="space-y-1 border-b pb-3 last:border-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm font-medium gap-1">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">{b.categoryName}</span>
                      <span className="text-gray-500 text-xs">
                        {periodo} • {formatDate(b.startDate)} al{" "}
                        {formatDate(b.endDate)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end sm:items-center sm:flex-row gap-1 sm:gap-2 text-right sm:text-left mt-1">
                      <span
                        className={excedido ? "text-red-600 font-bold" : ""}
                      >
                        ${b.spentAmount.toLocaleString("es-AR")}
                        <span className="text-gray-400 font-normal">
                          {" "}
                          / ${b.limitAmount.toLocaleString("es-AR")}
                        </span>
                      </span>
                      {excedido && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] h-5"
                        >
                          Excedido
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2 mt-2 bg-gray-100"
                    indicatorClassName={colorClass}
                  />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
