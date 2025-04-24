import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Budget } from "./types";

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/budgets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(res.data);
    } catch (err) {
      console.error("Error al obtener presupuestos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    window.addEventListener("budget-updated", fetchBudgets);
    return () => window.removeEventListener("budget-updated", fetchBudgets);
  }, []);

  return { budgets, loading, refetch: fetchBudgets };
};
