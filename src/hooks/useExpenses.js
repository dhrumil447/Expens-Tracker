import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback, useMemo } from "react";

const STORAGE_KEY = "dhanpath_rn_expenses";

const DEFAULT_TRANSACTIONS = [
  {
    id: "1",
    name: "Salary Credit",
    categoryEmoji: "💼",
    categoryLabel: "Salary",
    amount: 45000,
    txType: "income",
    timestamp: Date.now() - 86400000 * 5,
  },
  {
    id: "2",
    name: "Swiggy Order",
    categoryEmoji: "🍕",
    categoryLabel: "Food",
    amount: 349,
    txType: "expense",
    timestamp: Date.now() - 86400000 * 3,
  },
  {
    id: "3",
    name: "Amazon",
    categoryEmoji: "🛒",
    categoryLabel: "Shopping",
    amount: 1299,
    txType: "expense",
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: "4",
    name: "Netflix",
    categoryEmoji: "🎬",
    categoryLabel: "Entertainment",
    amount: 649,
    txType: "expense",
    timestamp: Date.now() - 86400000,
  },
  {
    id: "5",
    name: "Freelance",
    categoryEmoji: "💻",
    categoryLabel: "Work",
    amount: 8000,
    txType: "income",
    timestamp: Date.now() - 3600000 * 3,
  },
];

export function useExpenses() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setTransactions(JSON.parse(stored));
        } else {
          setTransactions(DEFAULT_TRANSACTIONS);
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(DEFAULT_TRANSACTIONS),
          );
        }
      } catch (e) {
        setTransactions(DEFAULT_TRANSACTIONS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (txns) => {
    setTransactions(txns);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
    } catch {}
  }, []);

  const addTransaction = useCallback(async (data) => {
    setTransactions((prev) => {
      const newTx = {
        id: Date.now().toString(),
        name: data.name || data.categoryLabel,
        categoryEmoji: data.categoryEmoji,
        categoryLabel: data.categoryLabel,
        amount: parseFloat(data.amount),
        txType: data.txType,
        note: data.note || "",
        date: data.date || new Date().toISOString().split("T")[0],
        timestamp: Date.now(),
      };
      const updated = [newTx, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(
        () => {},
      );
      return updated;
    });
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);

      // Defer storage write to not block UI
      InteractionManager.runAfterInteractions(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(
          () => {},
        );
      });

      return updated;
    });
  }, []);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.txType === "income")
        .reduce((s, t) => s + t.amount, 0),
    [transactions],
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.txType === "expense")
        .reduce((s, t) => s + t.amount, 0),
    [transactions],
  );

  const balance = useMemo(
    () => totalIncome - totalExpense,
    [totalIncome, totalExpense],
  );

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    totalIncome,
    totalExpense,
    balance,
  };
}
