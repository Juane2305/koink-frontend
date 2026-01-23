import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  PlusCircle,
  Target,
  TrendingUp,
  Pencil,
  Trash2,
  ArrowRightLeft,
} from "lucide-react";
import { useGoals } from "../hooks/useGoals";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { GoalModal } from "./goals/GoalModal";
import { TransferFundsModal } from "./goals/TransferFundsModal";
import { Goal } from "../types/goals";
import { supabase } from "../lib/supabase";

import { useCurrency } from "../context/CurrencyContext"; // Import useCurrency

export const GoalsPage = () => {
  const { currency } = useCurrency(); // Get active currency
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [transferGoal, setTransferGoal] = useState<Goal | null>(null);

  const { goals, loading, refetch } = useGoals();
  const { data: dashboardData, refetch: refetchDashboard } = useDashboardData();

  const totalBalance = dashboardData?.balance || 0;
  const availableBalance = dashboardData?.availableBalance || 0;
  const totalReserved = dashboardData?.reservedAmount || 0;

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar esta meta? Los fondos reservados volverán al balance disponible.",
      )
    )
      return;
    try {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
      refetch();
      refetchDashboard();
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-indigo-500" />
            Metas de Ahorro
          </h1>
          <p className="text-sm text-slate-500">
            Trackea tu progreso y alcanza tus objetivos financieros.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingGoal(null);
            setShowModal(true);
          }}
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Nueva Meta
        </Button>
      </div>

      {!loading && goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="pt-6">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                Balance Total
              </p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900">
                {currency === "USD" ? "U$S" : "$"}
                {totalBalance.toLocaleString("es-AR")}
              </h3>
            </CardContent>
          </Card>
          <Card className="bg-indigo-600 text-white border-none shadow-md shadow-indigo-100">
            <CardContent className="pt-6">
              <p className="text-indigo-100 text-[10px] uppercase font-bold tracking-wider">
                Disponible para Gastar
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {currency === "USD" ? "U$S" : "$"}
                {availableBalance.toLocaleString("es-AR")}
              </h3>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 text-emerald-900 border-none shadow-sm">
            <CardContent className="pt-6">
              <p className="text-emerald-600/70 text-[10px] uppercase font-bold tracking-wider">
                Total Ahorrado en Metas
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {currency === "USD" ? "U$S" : "$"}
                {totalReserved.toLocaleString("es-AR")}
              </h3>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse h-40" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="p-4 bg-white rounded-full shadow-sm">
              <TrendingUp className="h-8 w-8 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-900">
                No hay metas registradas
              </p>
              <p className="text-sm text-slate-500">
                Comienza creando tu primera meta de ahorro.
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowModal(true)}>
              Crear meta ahora
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {goals.map((goal) => {
            const percentage = Math.min(
              (goal.current_amount / goal.target_amount) * 100,
              100,
            );
            const isReached = percentage >= 100;

            return (
              <Card
                key={goal.id}
                className="group relative overflow-hidden transition-all hover:shadow-md border-none shadow-sm"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold">
                        {goal.name}
                      </CardTitle>
                      {goal.deadline && (
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <PlusCircle className="h-3 w-3" />
                          Meta:{" "}
                          {new Date(goal.deadline as string).toLocaleDateString(
                            "es-AR",
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingGoal(goal);
                          setShowModal(true);
                        }}
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(goal.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        Ahorrado
                      </p>
                      <h4 className="text-2xl font-bold text-slate-900 leading-none">
                        {currency === "USD" ? "U$S" : "$"}
                        {goal.current_amount.toLocaleString("es-AR")}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        de {currency === "USD" ? "U$S" : "$"}
                        {goal.target_amount.toLocaleString("es-AR")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 gap-2 border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 font-medium"
                      onClick={() => setTransferGoal(goal)}
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      Transferir
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <Progress
                      value={percentage}
                      className="h-3 bg-slate-100"
                      indicatorClassName={
                        isReached ? "bg-emerald-500" : "bg-indigo-500"
                      }
                    />
                    <div className="flex justify-between text-xs font-medium">
                      <span
                        className={
                          isReached ? "text-emerald-600" : "text-indigo-600"
                        }
                      >
                        {percentage.toFixed(1)}% completado
                      </span>
                      <span className="text-slate-500">
                        Restan {currency === "USD" ? "U$S" : "$"}
                        {Math.max(
                          0,
                          goal.target_amount - goal.current_amount,
                        ).toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>

                  {/* Lógica de Tiempo y Recomendación */}
                  {!isReached && goal.deadline && (
                    <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">
                          Te recomendamos ahorrar
                        </p>
                        <p className="text-sm font-bold text-indigo-600">
                          {currency === "USD" ? "U$S" : "$"}
                          {(() => {
                            const remaining =
                              goal.target_amount - goal.current_amount;
                            const months = Math.max(
                              1,
                              (new Date(goal.deadline as string).getTime() -
                                new Date().getTime()) /
                                (1000 * 60 * 60 * 24 * 30.44),
                            );
                            return Math.ceil(remaining / months).toLocaleString(
                              "es-AR",
                            );
                          })()}{" "}
                          <span className="text-[10px] font-normal text-slate-400">
                            / mes
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {isReached && (
                    <div className="absolute top-0 right-0 p-2">
                      <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm">
                        ¡ALCANZADA! 🎉
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <GoalModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingGoal(null);
          refetch();
          refetchDashboard();
        }}
        initialData={editingGoal || undefined}
      />

      <TransferFundsModal
        open={!!transferGoal}
        onClose={() => {
          setTransferGoal(null);
          refetch();
          refetchDashboard();
        }}
        goal={transferGoal}
        availableBalance={availableBalance}
      />
    </div>
  );
};
