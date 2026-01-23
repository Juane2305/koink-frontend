import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Plus,
  CheckCircle2,
  Pencil,
  Trash,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { ScheduledPaymentModal } from "../../components/ScheduledPaymentModal";
import { format, isToday, isBefore, addDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export interface ScheduledPayment {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  recurring: boolean;
  frequency: string;
  category_id: string | null;
  currency: string;
  categories?: {
    name: string;
  };
}

export const PendingPaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<ScheduledPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ScheduledPayment | null>(
    null,
  );

  const fetchPayments = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("scheduled_payments")
        .select("*, categories(name)")
        .order("due_date", { ascending: true });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching scheduled payments:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleMarkAsPaid = async (payment: ScheduledPayment) => {
    try {
      // 1. Crear la transacción en la tabla 'transactions'
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user?.id,
        description: payment.description,
        amount: payment.amount,
        type: "EXPENSE",
        category_id: payment.category_id,
        date: new Date().toISOString().split("T")[0],
        currency: payment.currency,
      });

      if (txError) throw txError;

      if (payment.recurring) {
        // 2. Si es recurrente, actualizar la fecha al próximo mes (mismo día)
        const currentDate = parseISO(payment.due_date);
        const nextMonthDate = new Date(currentDate);
        nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

        const { error: updateError } = await supabase
          .from("scheduled_payments")
          .update({ due_date: nextMonthDate.toISOString().split("T")[0] })
          .eq("id", payment.id);

        if (updateError) throw updateError;
      } else {
        // 3. Si no es recurrente, eliminar el pago agendado
        const { error: deleteError } = await supabase
          .from("scheduled_payments")
          .delete()
          .eq("id", payment.id);

        if (deleteError) throw deleteError;
      }

      // 4. Disparar evento para que otros componentes se enteren de la nueva transacción
      window.dispatchEvent(new Event("transaction-updated"));
      fetchPayments();
    } catch (error) {
      console.error("Error marking as paid:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_payments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchPayments();
    } catch (error) {
      console.error("Error deleting scheduled payment:", error);
    }
  };

  const getStatusInfo = (dueDateStr: string) => {
    const dueDate = parseISO(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isToday(dueDate) || isBefore(dueDate, today)) {
      return {
        label: "Vence hoy/vencido",
        color: "text-red-600 bg-red-50 border-red-100",
        icon: AlertCircle,
      };
    }

    const threeDaysFromNow = addDays(today, 3);
    if (isBefore(dueDate, threeDaysFromNow)) {
      return {
        label: "Vence pronto",
        color: "text-amber-600 bg-amber-50 border-amber-100",
        icon: Calendar,
      };
    }

    return {
      label: "Pendiente",
      color: "text-slate-600 bg-slate-50 border-slate-100",
      icon: Calendar,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pagos Pendientes
          </h1>
          <p className="text-muted-foreground">
            Administra tus gastos programados y recurrentes.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPayment(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pendiente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximos Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-8 text-muted-foreground animate-pulse">
                Cargando...
              </p>
            ) : payments.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  No hay pagos pendientes agendados
                </p>
                <p className="text-sm text-slate-400">
                  ¡Agregá uno para empezar a organizarte!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {payments.map((payment) => {
                  const status = getStatusInfo(payment.due_date);
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={payment.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2 rounded-lg border ${status.color}`}
                        >
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {payment.description}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(
                                parseISO(payment.due_date),
                                "dd 'de' MMMM, yyyy",
                                { locale: es },
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payment.categories?.name || "Sin categoría"}
                            </p>
                            {payment.recurring && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase">
                                Recurrente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6">
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">
                            {payment.currency === "USD" ? "U$S" : "$"}
                            {Number(payment.amount).toLocaleString("es-AR", {
                              useGrouping: true,
                              minimumFractionDigits: 0,
                            })}
                          </p>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleMarkAsPaid(payment)}
                            title="Marcar como pagado"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingPayment(payment);
                              setIsModalOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(payment.id)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <ScheduledPaymentModal
          open={isModalOpen}
          editingPayment={editingPayment}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPayment(null);
          }}
          onSaved={() => {
            setIsModalOpen(false);
            setEditingPayment(null);
            fetchPayments();
          }}
        />
      )}
    </div>
  );
};
