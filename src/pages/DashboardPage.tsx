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
import { ArrowDownCircle, ArrowUpCircle, DollarSign } from "lucide-react";
import { RecentTransactionsCard } from "../components/RecentTransactionsCard";
import { ActiveBudgetsCard } from "../components/ActiveBudgetsCard";
import { CreateTransactionModal } from "../components/CreateTransactionModal";
import { Button } from "../components/ui/button";
import { LogoutButton } from "../components/LogoutButton";
import { ReportsChart } from "../components/ReportsChart";

export const DashboardPage = () => {
  const { data, loading, refetch } = useDashboardData();
  const [showModal, setShowModal] = useState(false);
  const [typeSelected, setTypeSelected] = useState<"INCOME" | "EXPENSE">("INCOME");

  useEffect(() => {
    const handleUpdate = () => {
      refetch();
    };
    window.addEventListener("transaction-created", handleUpdate);
    return () =>
      window.removeEventListener("transaction-created", handleUpdate);
  }, [refetch]);

  const user = useUser();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-center mt-10 text-red-500">
        No se pudieron cargar los datos.
      </p>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50">
      <div className="flex justify-end">
        <LogoutButton />
      </div>

      <h1 className="text-center text-2xl font-semibold mt-5">
        {user ? `Bienvenido, ${user.name.split(" ")[0]} 👋` : "Koink App"}
      </h1>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold mt-10">Dashboard</h2>

        <div className="">
          <Button
            onClick={() => {setShowModal(true) ; setTypeSelected("EXPENSE");}}
            className="w-full sm:w-auto cursor-pointer"
          >
            Registrar ingreso / egreso
          </Button>
        </div>

        <CreateTransactionModal
          open={showModal}
          onClose={() => setShowModal(false)}
          typeSelected={typeSelected}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="bg-green-100 border-green-300 cursor-pointer" onClick={() => { setShowModal(true); setTypeSelected("INCOME"); }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <ArrowUpCircle className="h-6 w-6 text-green-700" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-800">
              ${data.totalIncome.toLocaleString("es-AR")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-100 border-red-300 cursor-pointer" onClick={()=> {setShowModal(true); setTypeSelected("EXPENSE");}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos</CardTitle>
            <ArrowDownCircle className="h-6 w-6 text-red-700" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-800">
              ${data.totalExpense.toLocaleString("es-AR")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-100 border-blue-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <DollarSign className="h-6 w-6 text-blue-700" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-800">
              ${data.balance.toLocaleString("es-AR")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CONTENIDO */}
      <div className="grid gap-4 md:grid-cols-2">
        <ActiveBudgetsCard />
        <RecentTransactionsCard />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <ReportsChart />
      </div>
    </div>
  );
};
