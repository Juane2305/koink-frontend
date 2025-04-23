// src/hooks/useDashboardData.ts
import { useEffect, useState } from "react"
import axios from "axios"

interface DashboardData {
  totalIncome: number
  totalExpense: number
  balance: number
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  // 🔹 Ahora está fuera del useEffect
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("https://koink-backend-production.up.railway.app/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setData(response.data)
    } catch (error) {
      console.error("Error al cargar dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, refetch: fetchData }
}
