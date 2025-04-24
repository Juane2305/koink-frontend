import { useEffect, useState } from "react";
import api from "../lib/api";
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

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
  "#ffc0cb",
];

export const ReportsChart = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  type MonthlySpending = {
    month: number;
    totalSpent: number;
  };

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
      setLoading(true);
      const [catRes, monthRes] = await Promise.all([
        api.get(
          `/api/reports/monthly?month=${month}&year=${year}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        api.get(
          `/api/reports/yearly?year=${year}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      setCategoryData(catRes.data);
      setMonthlyData(
        monthRes.data.map((item: MonthlySpending) => ({
          ...item,
          month: new Date(year, item.month - 1).toLocaleString("es-AR", {
            month: "short",
          }),
        }))
      );
    } catch (err) {
      console.error("Error cargando datos de reportes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handler = () => fetchData();
    window.addEventListener("transaction-created", handler);
    return () => window.removeEventListener("transaction-created", handler);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[350px]" />
        <Skeleton className="h-[350px]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Gastos por categoría (mes actual)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          {categoryData.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay datos para mostrar este mes.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="totalSpent"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => `$${val.toLocaleString("es-AR")}`}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gasto total por mes (últimos meses)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          {monthlyData.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay registros suficientes para graficar.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(val: number) => `$${val.toLocaleString("es-AR")}`}
                />
                <Legend />
                <Bar dataKey="totalSpent" fill="#8884d8" name="Gasto" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
