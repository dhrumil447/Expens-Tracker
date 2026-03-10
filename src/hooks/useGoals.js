import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "dhanpath_rn_goals";

const DEFAULT_GOALS = [
  {
    id: "1",
    name: "Emergency Fund",
    emoji: "🛡️",
    target: 50000,
    saved: 32000,
    deadline: "Jun 2026",
  },
  {
    id: "2",
    name: "Goa Trip",
    emoji: "🏖️",
    target: 25000,
    saved: 12000,
    deadline: "Apr 2026",
  },
  {
    id: "3",
    name: "New Laptop",
    emoji: "💻",
    target: 80000,
    saved: 80000,
    deadline: "Mar 2026",
  },
];

export function useGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        setGoals(stored ? JSON.parse(stored) : DEFAULT_GOALS);
        if (!stored)
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(DEFAULT_GOALS),
          );
      } catch {
        setGoals(DEFAULT_GOALS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (g) => {
    setGoals(g);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(g));
    } catch {}
  }, []);

  const addGoal = useCallback(
    (data) => {
      const newGoal = {
        id: Date.now().toString(),
        name: data.name,
        emoji: data.emoji || "🎯",
        target: parseFloat(data.target),
        saved: 0,
        deadline: data.deadline || "",
      };
      persist([newGoal, ...goals]);
    },
    [goals, persist],
  );

  const fundGoal = useCallback(
    (id, amount) => {
      const updated = goals.map((g) =>
        g.id === id
          ? { ...g, saved: Math.min(g.saved + parseFloat(amount), g.target) }
          : g,
      );
      persist(updated);
    },
    [goals, persist],
  );

  const deleteGoal = useCallback(
    (id) => {
      persist(goals.filter((g) => g.id !== id));
    },
    [goals, persist],
  );

  return { goals, loading, addGoal, fundGoal, deleteGoal };
}
