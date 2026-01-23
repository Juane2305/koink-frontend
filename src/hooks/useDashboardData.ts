import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";

export const useDashboardData = () => {
  const { currency } = useCurrency();
  const [data, setData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    reservedAmount: 0,
    availableBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Pedimos todas las transacciones del usuario actual filtradas por moneda
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("type, amount")
        .eq("currency", currency);

      if (error) throw error;

      // Calculamos los totales en el frontend
      let income = 0;
      let expense = 0;

      transactions?.forEach((t) => {
        const amount = Number(t.amount); // Aseguramos que sea número
        if (t.type === "INCOME") income += amount;
        if (t.type === "EXPENSE") expense += amount;
      });

      // 2. Pedimos el acumulado de las metas (filtrando por moneda)
      const { data: goals, error: goalsError } = await supabase
        .from("goals")
        .select("current_amount")
        .eq("currency", currency);

      if (goalsError) throw goalsError;

      const totalReserved =
        goals?.reduce((acc, g) => acc + Number(g.current_amount), 0) || 0;

      setData({
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        reservedAmount: totalReserved,
        availableBalance: income - expense - totalReserved,
      });
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Retornamos refetch por si necesitas recargar los datos manualmente
  return { data, loading, refetch: fetchData };
};
