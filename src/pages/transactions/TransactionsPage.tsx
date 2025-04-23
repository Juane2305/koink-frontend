import { useEffect, useState } from "react";
import axios from "axios";
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

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: "INCOME" | "EXPENSE";
  categoryName: string;
  categoryId: number;
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

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://koink-backend-production.up.railway.app/api/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTransactions(response.data.reverse());
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    const handleUpdate = () => fetchTransactions();
    window.addEventListener("transaction-created", handleUpdate);
    return () =>
      window.removeEventListener("transaction-created", handleUpdate);
  }, []);

  const handleDelete = async () => {
    if (!transactionToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://koink-backend-production.up.railway.app/api/transactions/${transactionToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowConfirmDelete(false);
      setTransactionToDelete(null);
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
          <Button
            variant="outline"
            onClick={() => setShowCreateCategoryModal(true)}
            className="mt-4"
          >
            Crear nueva categoría
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="cursor-pointer mt-2"
          >
            Agregar transacción
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {loading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay transacciones registradas.
              </p>
            ) : (
              transactions.map((tx) => {
                const [year, month, day] = tx.date.split("-").map(Number);
                const localDate = new Date(year, month - 1, day);
                return (
                  <div
                    key={tx.id}
                    className="flex justify-between items-start text-sm border-b pb-1"
                  >
                    <div className="flex-1">
                      <p className="font-medium truncate max-w-[180px]">
                        {tx.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.categoryName} -{" "}
                        {localDate.toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end min-w-[80px]">
                      <p
                        className={`text-sm font-semibold text-right ${
                          tx.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}$
                        {tx.amount.toLocaleString("es-AR")}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => setEditingTransaction(tx)}
                          className="text-muted-foreground hover:text-black transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            console.log("Eliminar transacción", tx.id)
                          }
                          className="text-muted-foreground hover:text-destructive transition"
                        >
                          <Trash
                            className="w-4 h-4"
                            onClick={() => {
                              setTransactionToDelete(tx);
                              setShowConfirmDelete(true);
                            }}
                          />
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

      {editingTransaction && (
        <EditTransactionModal
          open={!!editingTransaction}
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {showCreateModal && (
        <CreateTransactionModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      {showCreateCategoryModal && (
        <CreateCategoryModal
          open={showCreateCategoryModal}
          onClose={() => setShowCreateCategoryModal(false)}
          onCreated={() => {
            setShowCreateCategoryModal(false);
          }}
        />
      )}

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
