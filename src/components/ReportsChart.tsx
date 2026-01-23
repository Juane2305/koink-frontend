import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext"; // Import useCurrency
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { PieChart as PieIcon, TrendingUp } from "lucide-react";

const MODERN_COLORS = [
  "#6366f1",
  "#f43f5e",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#64748b",
];

const CustomTooltip = ({ active, payload }: any) => {
  const { currency } = useCurrency();
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 border rounded-lg shadow-xl ring-1 ring-black/5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          {payload[0].name ||
            payload[0].payload.month ||
            payload[0].payload.name}
        </p>
        <p className="text-lg font-semibold text-slate-900">
          {currency === "USD" ? "U$S" : "$"}
          {payload[0].value.toLocaleString("es-AR")}
        </p>
      </div>
    );
  }
  return null;
};

export const ReportsChart = () => {
  const { currency } = useCurrency(); // Get active currency
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const startOfYear = new Date(currentYear, 0, 1).toISOString();

      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("amount, date, categories(name)")
        .eq("type", "EXPENSE")
        .eq("currency", currency) // Filter by currency
        .gte("date", startOfYear);

      if (error) throw error;
      if (!transactions) return;

      const categoryMap: Record<string, number> = {};
      const monthlyTotals: Record<number, number> = {};

      for (let i = 0; i <= currentMonth; i++) {
        monthlyTotals[i] = 0;
      }

      transactions.forEach((tx: any) => {
        const txDate = new Date(tx.date);
        const txMonth = txDate.getUTCMonth();
        const txAmount = Number(tx.amount);

        // Actualizar totales mensuales
        if (monthlyTotals[txMonth] !== undefined) {
          monthlyTotals[txMonth] += txAmount;
        }

        // --- SOLUCIÓN AL ERROR DE LÍNEA 81 ---
        // Manejamos si 'categories' viene como objeto o como array
        if (txMonth === currentMonth) {
          let catName = "Sin categoría";
          if (tx.categories) {
            catName = Array.isArray(tx.categories)
              ? tx.categories[0]?.name
              : tx.categories.name;
          }
          categoryMap[catName] = (categoryMap[catName] || 0) + txAmount;
        }
      });

      setCategoryData(
        Object.keys(categoryMap).map((name) => ({
          name: name,
          value: categoryMap[name],
        })),
      );

      setMonthlyData(
        Object.keys(monthlyTotals).map((mIndex) => ({
          month: new Date(currentYear, Number(mIndex)).toLocaleString("es-AR", {
            month: "short",
          }),
          totalSpent: monthlyTotals[Number(mIndex)],
        })),
      );
    } catch (err) {
      console.error("Error al procesar reportes:", err);
    } finally {
      setLoading(false);
    }
  }, [currency]); // Add currency dependency

  useEffect(() => {
    fetchData();
    const handler = () => fetchData();
    window.addEventListener("transaction-created", handler);
    window.addEventListener("transaction-updated", handler);
    return () => {
      window.removeEventListener("transaction-created", handler);
      window.removeEventListener("transaction-updated", handler);
    };
  }, [fetchData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
      <Card className="overflow-hidden border-none shadow-md bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">
              Gastos por Categoría
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribución del mes actual
            </p>
          </div>
          <div className="p-2 bg-indigo-50 rounded-full">
            <PieIcon className="w-5 h-5 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent className="h-[320px]">
          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
              <PieIcon className="w-12 h-12 opacity-20" />
              <p className="text-sm italic">Sin gastos este mes</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={MODERN_COLORS[index % MODERN_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-md bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">
              Evolución Anual
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Gasto mensual en {new Date().getFullYear()}
            </p>
          </div>
          <div className="p-2 bg-emerald-50 rounded-full">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar
                dataKey="totalSpent"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
