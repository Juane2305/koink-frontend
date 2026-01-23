import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Goal } from "../types/goals";

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      console.error("Error fetching goals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return { goals, loading, refetch: fetchGoals };
};
