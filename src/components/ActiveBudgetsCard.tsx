import { useEffect, useState } from "react"
import axios from "axios"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { Badge } from "../components/ui/badge"

interface ActiveBudget {
  id: number
  categoryName: string
  limitAmount: number
  spentAmount: number
}

export const ActiveBudgetsCard = () => {
  const [budgets, setBudgets] = useState<ActiveBudget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:8080/api/budgets/active", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setBudgets(response.data)
      } catch (error) {
        console.error("Error fetching active budgets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [])

  const getColorClass = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500"
    if (percentage >= 50) return "bg-yellow-400"
    return "bg-green-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Presupuestos activos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : budgets.length === 0 ? (
            <p className="text-sm text-gray-500">No hay presupuestos activos.</p>
          ) : (
            budgets.map((b) => {
              const percentage = Math.min((b.spentAmount / b.limitAmount) * 100, 100)
              const colorClass = getColorClass(percentage)
              const excedido = b.spentAmount > b.limitAmount

              return (
                <div key={b.id}>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>{b.categoryName}</span>
                    <div className="flex items-center gap-2">
                      <span>
                        ${b.spentAmount.toLocaleString("es-AR")} / ${b.limitAmount.toLocaleString("es-AR")}
                      </span>
                      {excedido && (
                        <Badge variant="destructive">
                          🔥 Excedido
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2 mt-2"
                    indicatorClassName={colorClass}
                  />
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
