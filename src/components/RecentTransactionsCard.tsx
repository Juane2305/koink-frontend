import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";


interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: "INCOME" | "EXPENSE";
  categoryName: string;
  categoryId: number;
}

export const RecentTransactionsCard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);


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
      console.error("Error fetching recent transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    const handleUpdate = () => {
      fetchTransactions();
    };

    window.addEventListener("transaction-created", handleUpdate);
    return () => {
      window.removeEventListener("transaction-created", handleUpdate);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Últimas 10 transacciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {loading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay transacciones recientes.
            </p>
          ) : (
            transactions.slice(0,10).map((tx) => {
              const [year, month, day] = tx.date.split("-").map(Number);
              const localDate = new Date(year, month - 1, day);

              return (
                <div
                  key={tx.id}
                  className="flex justify-between items-center border-b pb-1 text-sm"
                >
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.categoryName?.trim() || "Sin categoría"} -{" "}
                      {localDate.toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === "INCOME" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}$
                    {tx.amount.toLocaleString("es-AR")}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
