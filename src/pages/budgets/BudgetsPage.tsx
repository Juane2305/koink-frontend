import { useState } from "react";
import { Button } from "../../components/ui/button";
import { BudgetCard } from "./BudgetCard";
import { BudgetModal } from "./BudgetModal";
import { PlusCircle } from "lucide-react";
import { useBudgets } from "./useBudgets";


export const BudgetsPage = () => {
    const [showModal, setShowModal] = useState(false);
    const { budgets, loading, refetch } = useBudgets(); 
  
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Presupuestos</h1>
        </div>
        <div className="flex justify-end">
            <Button onClick={() => setShowModal(true)}>
              <PlusCircle className="w-5 h-5 mr-2" /> Nuevo presupuesto
            </Button>
        </div>
  
        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : budgets.length === 0 ? (
          <p className="text-gray-500">No tenés presupuestos registrados aún.</p>
        ) : (
          <div className="grid gap-4 pb-20 pt-6">
            {budgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} onRefresh={refetch} />
            ))}
          </div>
        )}
  
        <BudgetModal open={showModal} onClose={() => setShowModal(false)} />
      </div>
    );
  };
  
