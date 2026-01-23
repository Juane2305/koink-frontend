import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Loader2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Goal } from "../../types/goals";

interface Props {
  open: boolean;
  onClose: () => void;
  goal: Goal | null;
  availableBalance: number;
}

export const TransferFundsModal = ({
  open,
  onClose,
  goal,
  availableBalance,
}: Props) => {
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount(0);
      setType("DEPOSIT");
      setErrorMessage(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;
    setErrorMessage(null);

    if (amount <= 0) {
      setErrorMessage("El monto debe ser mayor a 0.");
      return;
    }

    if (type === "DEPOSIT" && amount > availableBalance) {
      setErrorMessage(
        `No tienes suficiente balance disponible ($${availableBalance.toLocaleString("es-AR")}).`,
      );
      return;
    }

    if (type === "WITHDRAW" && amount > goal.current_amount) {
      setErrorMessage(
        `No puedes retirar más de lo que la meta tiene ahorrado ($${goal.current_amount.toLocaleString("es-AR")}).`,
      );
      return;
    }

    setLoading(true);

    const newAmount =
      type === "DEPOSIT"
        ? goal.current_amount + amount
        : goal.current_amount - amount;

    try {
      const { error } = await supabase
        .from("goals")
        .update({ current_amount: newAmount })
        .eq("id", goal.id);

      if (error) throw error;
      onClose();
    } catch (err) {
      console.error("Error al transferir fondos:", err);
      setErrorMessage("Error al procesar la transferencia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {type === "DEPOSIT" ? (
              <TrendingUp className="text-emerald-500" />
            ) : (
              <TrendingDown className="text-orange-500" />
            )}
            {type === "DEPOSIT" ? "Reservarfondos" : "Retirar fondos"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex p-1 bg-slate-100 rounded-lg my-4">
          <button
            onClick={() => setType("DEPOSIT")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === "DEPOSIT" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Ahorrar
          </button>
          <button
            onClick={() => setType("WITHDRAW")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === "WITHDRAW" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Retirar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {type === "DEPOSIT" ? "Monto a reservar" : "Monto a liberar"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                $
              </span>
              <Input
                type="text"
                inputMode="numeric"
                className="pl-7 h-12 text-xl font-bold"
                value={amount ? amount.toLocaleString("es-AR") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setAmount(Number(raw) || 0);
                }}
                autoFocus
                placeholder="0"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              {type === "DEPOSIT"
                ? `Disponible en cuenta: $${availableBalance.toLocaleString("es-AR")}`
                : `Ahorrado en esta meta: $${goal?.current_amount.toLocaleString("es-AR")}`}
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              <AlertCircle className="h-4 w-4" />
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className={`w-full h-12 text-base font-bold shadow-lg ${type === "DEPOSIT" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : "bg-orange-600 hover:bg-orange-700 shadow-orange-100"}`}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : type === "DEPOSIT" ? (
              "Confirmar Reserva"
            ) : (
              "Confirmar Retiro"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
