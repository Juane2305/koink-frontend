import { useGoals } from "../hooks/useGoals";
import { useCurrency } from "../context/CurrencyContext"; // Import useCurrency
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Target, TrendingUp } from "lucide-react";

interface Props {
  balance: number;
}

export const SavingGoalsCard = ({ balance }: Props) => {
  const { currency } = useCurrency(); // Get active currency
  const { goals, loading } = useGoals();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            Metas de Ahorro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 animate-pulse">
            Cargando metas...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-500" />
          Metas de Ahorro
        </CardTitle>
        <div className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
          DISPONIBLE: {currency === "USD" ? "U$S" : "$"}
          {balance.toLocaleString("es-AR")}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2">
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
              <div className="p-3 bg-slate-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500">
                No tienes metas de ahorro aún.
              </p>
            </div>
          ) : (
            goals.map((goal) => {
              // Calculamos el porcentaje basado en lo ahorrado específicamente
              const percentage = Math.min(
                (goal.current_amount / goal.target_amount) * 100,
                100,
              );
              const remaining = Math.max(
                0,
                goal.target_amount - goal.current_amount,
              );

              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {goal.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                        <span className="text-indigo-600">
                          {currency === "USD" ? "U$S" : "$"}
                          {goal.current_amount.toLocaleString("es-AR")}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span>
                          {currency === "USD" ? "U$S" : "$"}
                          {goal.target_amount.toLocaleString("es-AR")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-indigo-600">
                        {percentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <Progress
                    value={percentage}
                    className="h-2 bg-slate-100"
                    indicatorClassName={
                      percentage >= 100 ? "bg-emerald-500" : "bg-indigo-500"
                    }
                  />

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">
                      {percentage >= 100 ? (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          ¡Meta alcanzada! 🎉
                        </span>
                      ) : goal.deadline ? (
                        <span className="text-indigo-600 font-medium">
                          Rec: {currency === "USD" ? "U$S" : "$"}
                          {(() => {
                            const months = Math.max(
                              1,
                              (new Date(goal.deadline as string).getTime() -
                                new Date().getTime()) /
                                (1000 * 60 * 60 * 24 * 30.44),
                            );
                            return Math.ceil(remaining / months).toLocaleString(
                              "es-AR",
                            );
                          })()}
                          /mes
                        </span>
                      ) : (
                        `Faltan ${currency === "USD" ? "U$S" : "$"}${remaining.toLocaleString("es-AR")}`
                      )}
                    </span>
                    {goal.deadline && percentage < 100 && (
                      <span className="text-slate-400 capitalize">
                        {new Date(goal.deadline as string).toLocaleDateString(
                          "es-AR",
                          { month: "short", year: "2-digit" },
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
