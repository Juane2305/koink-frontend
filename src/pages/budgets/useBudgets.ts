import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { Budget } from "./types";

// Función auxiliar para calcular el rango de fechas según el periodo
// (La misma que usamos en el Dashboard para que los números coincidan)
const getPeriodDates = (
  period: string,
  startDate: string,
  autoRenew: boolean,
) => {
  const originalStart = new Date(startDate);
  const now = new Date();

  // Si no se auto-renueva, mantenemos la lógica de un solo ciclo
  if (!autoRenew) {
    const end = new Date(originalStart);
    if (period === "DAILY") end.setDate(end.getDate() + 1);
    else if (period === "WEEKLY") end.setDate(end.getDate() + 7);
    else if (period === "MONTHLY") end.setMonth(end.getMonth() + 1);
    else if (period === "ANNUAL") end.setFullYear(end.getFullYear() + 1);
    end.setMilliseconds(end.getMilliseconds() - 1);
    return { start: originalStart.toISOString(), end: end.toISOString() };
  }

  // LÓGICA DE AUTO-RENOVACIÓN: Encontramos el ciclo que contiene el día de HOY
  let currentStart = new Date(originalStart);
  let currentEnd = new Date(originalStart);

  while (true) {
    currentEnd = new Date(currentStart);
    if (period === "DAILY") currentEnd.setDate(currentEnd.getDate() + 1);
    else if (period === "WEEKLY") currentEnd.setDate(currentEnd.getDate() + 7);
    else if (period === "MONTHLY")
      currentEnd.setMonth(currentEnd.getMonth() + 1);
    else if (period === "ANNUAL")
      currentEnd.setFullYear(currentEnd.getFullYear() + 1);

    currentEnd.setMilliseconds(currentEnd.getMilliseconds() - 1);

    // Si 'hoy' está antes del final de este ciclo, este es el ciclo actual
    if (now <= currentEnd) break;

    // Si no, saltamos al siguiente ciclo
    currentStart = new Date(currentEnd.getTime() + 1);
  }

  return { start: currentStart.toISOString(), end: currentEnd.toISOString() };
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
          const { start, end } = getPeriodDates(
            b.period,
            b.start_date,
            b.auto_renew,
          );

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
            spentAmount: totalSpent,
            period: b.period,
            startDate: start,
            endDate: end,
            autoRenew: b.auto_renew || false, // <--- AGREGAR ESTA LÍNEA
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
    window.addEventListener("transaction-created", handleUpdate);
    window.addEventListener("transaction-updated", handleUpdate);

    return () => {
      window.removeEventListener("budget-updated", handleUpdate);
      window.removeEventListener("transaction-created", handleUpdate);
      window.removeEventListener("transaction-updated", handleUpdate);
    };
  }, [fetchBudgets]);

  return { budgets, loading, refetch: fetchBudgets };
};
