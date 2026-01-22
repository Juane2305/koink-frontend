import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { Budget } from "./types";

// Función auxiliar para calcular el rango de fechas según el periodo
// (La misma que usamos en el Dashboard para que los números coincidan)
const getPeriodDates = (period: string, budgetStartDate: string) => {
  const start = new Date(budgetStartDate);
  const end = new Date(start);

  if (period === "DAILY") {
    end.setHours(23, 59, 59, 999);
  } else if (period === "WEEKLY") {
    end.setDate(start.getDate() + 7);
  } else if (period === "MONTHLY") {
    end.setMonth(start.getMonth() + 1);
  } else if (period === "ANNUAL") {
    end.setFullYear(start.getFullYear() + 1);
  }
  end.setMilliseconds(end.getMilliseconds() - 1);

  return { start: start.toISOString(), end: end.toISOString() };
};

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Traer los presupuestos y el nombre de la categoría
      const { data: budgetsData, error } = await supabase
        .from("budgets")
        .select(`*, categories (name)`);

      if (error) throw error;

      // 2. Calcular el gasto acumulado para cada presupuesto
      const budgetsWithSpentAmount = await Promise.all(
        (budgetsData || []).map(async (b: any) => {
          // 2. Pasá la fecha de inicio real
          const { start, end } = getPeriodDates(b.period, b.start_date);

          const { data: transactions } = await supabase
            .from("transactions")
            .select("amount")
            .eq("category_id", b.category_id)
            .eq("type", "EXPENSE")
            .gte("date", start)
            .lte("date", end);

          const totalSpent =
            transactions?.reduce((acc, curr) => acc + Number(curr.amount), 0) ||
            0;

          return {
            id: b.id,
            categoryId: b.category_id,
            categoryName: b.categories?.name || "Sin categoría",
            limitAmount: b.limit_amount,
            spentAmount: totalSpent, // <--- Aquí calculamos el monto que faltaba
            period: b.period,
            startDate: start,
            endDate: end,
          };
        }),
      );

      setBudgets(budgetsWithSpentAmount);
    } catch (err) {
      console.error("Error al obtener presupuestos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();

    // Escuchar actualizaciones para refrescar la lista
    const handleUpdate = () => fetchBudgets();
    window.addEventListener("budget-updated", handleUpdate);
    window.addEventListener("transaction-created", handleUpdate); // Si creas un gasto, se actualiza el presupuesto

    return () => {
      window.removeEventListener("budget-updated", handleUpdate);
      window.removeEventListener("transaction-created", handleUpdate);
    };
  }, [fetchBudgets]);

  return { budgets, loading, refetch: fetchBudgets };
};
