import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCOUNTS_STORAGE_KEY = "dhanpath_accounts";

const DEFAULT_ACCOUNTS = [
  {
    id: "cash",
    emoji: "💵",
    label: "Cash",
    type: "cash",
    balance: 0,
    isDefault: true,
  },
  {
    id: "bank",
    emoji: "🏦",
    label: "Bank Account",
    type: "bank",
    balance: 0,
    isDefault: false,
  },
  {
    id: "card",
    emoji: "💳",
    label: "Credit Card",
    type: "card",
    balance: 0,
    isDefault: false,
  },
  {
    id: "savings",
    emoji: "🐷",
    label: "Savings",
    type: "savings",
    balance: 0,
    isDefault: false,
  },
  {
    id: "wallet",
    emoji: "👛",
    label: "Digital Wallet",
    type: "wallet",
    balance: 0,
    isDefault: false,
  },
];

const AccountsContext = createContext();

export function AccountsProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const stored = await AsyncStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (stored) {
        setAccounts(JSON.parse(stored));
      } else {
        setAccounts(DEFAULT_ACCOUNTS);
        await AsyncStorage.setItem(
          ACCOUNTS_STORAGE_KEY,
          JSON.stringify(DEFAULT_ACCOUNTS),
        );
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
      setAccounts(DEFAULT_ACCOUNTS);
    } finally {
      setLoading(false);
    }
  };

  const saveAccounts = async (newAccounts) => {
    try {
      await AsyncStorage.setItem(
        ACCOUNTS_STORAGE_KEY,
        JSON.stringify(newAccounts),
      );
      setAccounts(newAccounts);
    } catch (error) {
      console.error("Error saving accounts:", error);
    }
  };

  const addAccount = async (account) => {
    const newAccount = {
      ...account,
      id: `account_${Date.now()}`,
      isCustom: true,
      balance: account.balance || 0,
    };
    const newAccounts = [...accounts, newAccount];
    await saveAccounts(newAccounts);
    return newAccount;
  };

  const updateAccount = async (accountId, updates) => {
    const newAccounts = accounts.map((acc) =>
      acc.id === accountId ? { ...acc, ...updates } : acc,
    );
    await saveAccounts(newAccounts);
  };

  const deleteAccount = async (accountId) => {
    const newAccounts = accounts.filter((acc) => acc.id !== accountId);
    await saveAccounts(newAccounts);
  };

  const setDefaultAccount = async (accountId) => {
    const newAccounts = accounts.map((acc) => ({
      ...acc,
      isDefault: acc.id === accountId,
    }));
    await saveAccounts(newAccounts);
  };

  const getDefaultAccount = () => {
    return accounts.find((acc) => acc.isDefault) || accounts[0];
  };

  const updateBalance = async (accountId, amount, isIncome) => {
    const newAccounts = accounts.map((acc) => {
      if (acc.id === accountId) {
        const newBalance = isIncome
          ? acc.balance + amount
          : acc.balance - amount;
        return { ...acc, balance: newBalance };
      }
      return acc;
    });
    await saveAccounts(newAccounts);
  };

  const resetToDefaults = async () => {
    await saveAccounts(DEFAULT_ACCOUNTS);
  };

  const value = {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    setDefaultAccount,
    getDefaultAccount,
    updateBalance,
    resetToDefaults,
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error("useAccounts must be used within AccountsProvider");
  }
  return context;
}
