import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase"; // Importamos Supabase
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { CreateTransactionModal } from "../../components/CreateTransactionModal";
import { EditTransactionModal } from "../../components/EditTransactionModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { CreateCategoryModal } from "../../components/CreateCategoryModal";
import { ManageCategoriesModal } from "../../components/ManageCategoriesModal";

// Actualizamos la interfaz para usar UUID (string)
interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "INCOME" | "EXPENSE";
  categories?: {
    name: string;
  };
  category_id: string;
  currency: string;
}

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] =
    useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      // Traemos todas las transacciones ordenadas por fecha
      const { data, error } = await supabase
        .from("transactions")
        .select("*, categories(name)")
        .order("date", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();

    const handleUpdate = () => fetchTransactions();
    window.addEventListener("transaction-created", handleUpdate);
    window.addEventListener("transaction-updated", handleUpdate);

    return () => {
      window.removeEventListener("transaction-created", handleUpdate);
      window.removeEventListener("transaction-updated", handleUpdate);
    };
  }, [fetchTransactions]);

  const handleDelete = async () => {
    if (!transactionToDelete) return;
    try {
      // Borrado directo en Supabase
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionToDelete.id);

      if (error) throw error;

      setShowConfirmDelete(false);
      setTransactionToDelete(null);

      // Disparar evento para que otros componentes (como el Dashboard) se enteren
      window.dispatchEvent(new Event("transaction-updated"));
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const navigate = useNavigate();

  const handleComeBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold cursor-default mb-5">
        Todas las transacciones
      </h1>
      <div className="flex justify-end gap-4">
        <Button
          onClick={handleComeBack}
          className="cursor-pointer mb-5"
          variant={"outline"}
        >
          Volver al dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historial completo</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setShowManageCategoriesModal(true)}
              className="mt-4"
            >
              Gestionar categorías
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateCategoryModal(true)}
              className="mt-4"
            >
              Crear nueva categoría
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="cursor-pointer mt-4"
            >
              Agregar transacción
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {loading ? (
              <p className="text-sm text-gray-400 animate-pulse">
                Cargando transacciones...
              </p>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay transacciones registradas.
              </p>
            ) : (
              transactions.map((tx) => {
                const localDate = new Date(tx.date);
                return (
                  <div
                    key={tx.id}
                    className="flex justify-between items-start text-sm border-b pb-2 pt-1"
                  >
                    <div className="flex-1">
                      <p className="font-medium truncate max-w-[180px]">
                        {tx.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.categories?.name || "Sin categoría"} -{" "}
                        {localDate.toLocaleDateString("es-AR", {
                          timeZone: "UTC",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end min-w-[100px]">
                      <p
                        className={`text-sm font-semibold text-right ${
                          tx.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}{" "}
                        {tx.currency === "USD" ? "U$S" : "$"}
                        {Number(tx.amount).toLocaleString("es-AR")}
                      </p>
                      <div className="flex gap-3 mt-1">
                        <button
                          onClick={() => setEditingTransaction(tx)}
                          className="text-muted-foreground hover:text-black transition p-1"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setTransactionToDelete(tx);
                            setShowConfirmDelete(true);
                          }}
                          className="text-muted-foreground hover:text-destructive transition p-1"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      {/* Modales */}
      {editingTransaction && (
        <EditTransactionModal
          open={!!editingTransaction}
          transaction={{
            id: editingTransaction.id,
            description: editingTransaction.description,
            amount: editingTransaction.amount,
            date: editingTransaction.date,
            type: editingTransaction.type,
            // Cambiamos categoryId por category_id y quitamos el Number()
            category_id: editingTransaction.category_id,
            categoryName: editingTransaction.categories?.name,
            currency: editingTransaction.currency,
          }}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {showCreateModal && (
        <CreateTransactionModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          typeSelected="EXPENSE"
        />
      )}

      {showCreateCategoryModal && (
        <CreateCategoryModal
          open={showCreateCategoryModal}
          onClose={() => setShowCreateCategoryModal(false)}
          onCreated={() => {
            setShowCreateCategoryModal(false);
            fetchTransactions(); // Refrescar para ver nombres de categorías nuevas si aplica
          }}
        />
      )}

      <ManageCategoriesModal
        open={showManageCategoriesModal}
        onClose={() => setShowManageCategoriesModal(false)}
        onChanged={() => {
          fetchTransactions(); // Refrescar por si se borraron categorías en uso (aunque el modal lo previene, por consistencia)
        }}
      />

      {/* Confirmación de Borrado */}
      {showConfirmDelete && transactionToDelete && (
        <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Eliminar transacción?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Esta acción eliminará{" "}
              <strong>{transactionToDelete.description}</strong> de forma
              permanente.
            </p>
            <div className="flex flex-col gap-2 mt-4">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
              >
                Confirmar
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowConfirmDelete(false);
                  setTransactionToDelete(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
