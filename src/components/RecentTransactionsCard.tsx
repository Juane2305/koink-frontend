import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase"; // Importamos Supabase
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

interface Transaction {
  id: string; // En Supabase los ID suelen ser UUID (strings)
  description: string;
  amount: number;
  date: string;
  type: "INCOME" | "EXPENSE";
  categories?: {
    name: string;
  };
}

export const RecentTransactionsCard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Consulta optimizada: Trae las últimas 10 transacciones + el nombre de la categoría
      const { data, error } = await supabase
        .from("transactions")
        .select("*, categories(name)") // Hacemos "Join" con la tabla categorias
        .order("date", { ascending: false }) // Ordenamos por fecha (más reciente primero)
        .limit(10); // Solo traemos 10

      if (error) throw error;

      setTransactions(data || []);
    } catch (error) {
      console.error("Error cargando transacciones:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();

    // Mantenemos tu lógica de escuchar eventos para actualizar la lista
    const handleUpdate = () => {
      fetchTransactions();
    };

    window.addEventListener("transaction-created", handleUpdate);
    return () => {
      window.removeEventListener("transaction-created", handleUpdate);
    };
  }, [fetchTransactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Últimas 10 transacciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {loading ? (
            <div className="space-y-3">
               <p className="text-sm text-gray-400 animate-pulse">Cargando movimientos...</p>
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay transacciones recientes.
            </p>
          ) : (
            transactions.map((tx) => {
              // Parseo de fecha simple y seguro
              const localDate = new Date(tx.date);
              // Ajuste de zona horaria manual si es necesario, o usar UTC
              // Para visualización simple:
              const formattedDate = localDate.toLocaleDateString("es-AR", {
                timeZone: "UTC" 
              });

              return (
                <div
                  key={tx.id}
                  className="flex justify-between items-center border-b pb-1 text-sm"
                >
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {/* Accedemos al nombre de la categoría a través de la relación */}
                      {tx.categories?.name || "Sin categoría"} -{" "}
                      {formattedDate}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === "INCOME" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}$
                    {Number(tx.amount).toLocaleString("es-AR")}
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