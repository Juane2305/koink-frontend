import { useEffect, useState } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import { useUser } from "../hooks/useUser";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  DollarSign, 
  PiggyBank, 
  Plus,
  LayoutDashboard
} from "lucide-react";
import { RecentTransactionsCard } from "../components/RecentTransactionsCard";
import { ActiveBudgetsCard } from "../components/ActiveBudgetsCard";
import { CreateTransactionModal } from "../components/CreateTransactionModal";
import { Button } from "../components/ui/button";
import { LogoutButton } from "../components/LogoutButton";
import { ReportsChart } from "../components/ReportsChart";
import { useNavigate } from "react-router-dom";

export const DashboardPage = () => {
  const { data, loading, refetch } = useDashboardData();
  const [showModal, setShowModal] = useState(false);
  const [typeSelected, setTypeSelected] = useState<"INCOME" | "EXPENSE">("INCOME");
  const navigate = useNavigate();
  const user = useUser();

  useEffect(() => {
    const handleUpdate = () => refetch();
    window.addEventListener("transaction-created", handleUpdate);
    return () => window.removeEventListener("transaction-created", handleUpdate);
  }, [refetch]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-center mt-10 text-red-500">Error al cargar datos.</p>;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <PiggyBank className="h-6 w-6" />
            <span className="hidden sm:inline tracking-tight">Koink.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:block">
              Hola, {user?.name.split(" ")[0]} 👋
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-8">
        {/* TÍTULO Y ACCIÓN PRINCIPAL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8 text-indigo-500" />
              Dashboard
            </h1>
            <p className="text-slate-500 text-sm">Gestiona tus movimientos y presupuestos.</p>
          </div>

          <Button
            onClick={() => { setShowModal(true); setTypeSelected("EXPENSE"); }}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all h-12 px-6"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nueva Transacción
          </Button>
        </div>

        {/* TARJETAS DE RESUMEN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* INGRESOS */}
          <Card 
            className="relative overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => { setShowModal(true); setTypeSelected("INCOME"); }}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Ingresos</CardTitle>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:scale-110 transition-transform">
                <ArrowUpCircle className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ${data.totalIncome.toLocaleString("es-AR")}
              </div>
            </CardContent>
          </Card>

          {/* EGRESOS */}
          <Card 
            className="relative overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => { setShowModal(true); setTypeSelected("EXPENSE"); }}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Egresos</CardTitle>
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600 group-hover:scale-110 transition-transform">
                <ArrowDownCircle className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ${data.totalExpense.toLocaleString("es-AR")}
              </div>
            </CardContent>
          </Card>

          {/* BALANCE */}
          <Card 
            className="relative overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow group sm:col-span-2 lg:col-span-1"
            onClick={() => navigate("/transactions")}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Balance Total</CardTitle>
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ${data.balance.toLocaleString("es-AR")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECCIÓN DE GRÁFICOS Y TABLAS */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Reportes Chart - Ocupa más espacio en desktop */}
          <div className="xl:col-span-12">
            <ReportsChart />
          </div>

          {/* Presupuestos y Transacciones lado a lado */}
          <div className="xl:col-span-5">
            <ActiveBudgetsCard />
          </div>
          <div className="xl:col-span-7">
            <RecentTransactionsCard />
          </div>
        </div>
      </main>

      <CreateTransactionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        typeSelected={typeSelected}
      />
    </div>
  );
};