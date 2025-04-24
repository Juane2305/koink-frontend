import { useEffect, useState } from "react";
import api from "../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";

interface ActiveBudget {
  id: number;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
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

export const ActiveBudgetsCard = () => {
  const [budgets, setBudgets] = useState<ActiveBudget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(
          "/api/budgets/active",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBudgets(response.data);
      } catch (error) {
        console.error("Error fetching active budgets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  const getColorClass = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 50) return "bg-yellow-400";
    return "bg-green-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Presupuestos activos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : budgets.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay presupuestos activos.
            </p>
          ) : (
            budgets.map((b) => {
              const percentage = Math.min(
                (b.spentAmount / b.limitAmount) * 100,
                100
              );
              const colorClass = getColorClass(percentage);
              const excedido = b.spentAmount > b.limitAmount;
              const periodo = periodMap[b.period] || b.period;

              return (
                <div key={b.id} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm font-medium gap-1">
                    <div className="flex flex-col items-start">
                      <span>{b.categoryName}</span>
                      <span className="text-gray-500 text-sm">
                        {periodo} • {formatDate(b.startDate)} al{" "}
                        {formatDate(b.endDate)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end sm:items-center sm:flex-row gap-1 sm:gap-2 text-right sm:text-left mt-2">
                      <span>
                        ${b.spentAmount.toLocaleString("es-AR")} / $
                        {b.limitAmount.toLocaleString("es-AR")}
                      </span>
                      {excedido && (
                        <Badge variant="destructive">🔥 Excedido</Badge>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2 mt-3"
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
