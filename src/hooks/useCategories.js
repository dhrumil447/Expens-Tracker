import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

const CATEGORIES_KEY = "dhanpath_categories";

const DEFAULT_EXPENSE_CATEGORIES = [
  {
    id: "food",
    emoji: "🍕",
    label: "Food",
    type: "expense",
    subcategories: ["Restaurant", "Groceries", "Snacks", "Drinks"],
  },
  {
    id: "shopping",
    emoji: "🛒",
    label: "Shopping",
    type: "expense",
    subcategories: ["Clothes", "Electronics", "Home", "Online"],
  },
  {
    id: "transport",
    emoji: "🚗",
    label: "Transport",
    type: "expense",
    subcategories: ["Fuel", "Uber/Ola", "Metro", "Bus", "Parking"],
  },
  {
    id: "bills",
    emoji: "⚡",
    label: "Bills",
    type: "expense",
    subcategories: ["Electricity", "Water", "Gas", "Internet", "Phone"],
  },
  {
    id: "entertainment",
    emoji: "🎬",
    label: "Entertainment",
    type: "expense",
    subcategories: ["Movies", "Games", "Subscriptions", "Events"],
  },
  {
    id: "health",
    emoji: "💊",
    label: "Health",
    type: "expense",
    subcategories: ["Medicine", "Doctor", "Gym", "Insurance"],
  },
  {
    id: "education",
    emoji: "📚",
    label: "Education",
    type: "expense",
    subcategories: ["Books", "Courses", "Fees", "Supplies"],
  },
  {
    id: "travel",
    emoji: "✈️",
    label: "Travel",
    type: "expense",
    subcategories: ["Flight", "Hotel", "Food", "Activities"],
  },
  {
    id: "social",
    emoji: "🍺",
    label: "Social",
    type: "expense",
    subcategories: ["Party", "Gifts", "Dining Out"],
  },
  {
    id: "rent",
    emoji: "🏠",
    label: "Rent",
    type: "expense",
    subcategories: ["Rent", "Maintenance", "Society"],
  },
  {
    id: "personal",
    emoji: "💇",
    label: "Personal",
    type: "expense",
    subcategories: ["Salon", "Spa", "Self Care"],
  },
  {
    id: "others",
    emoji: "🐾",
    label: "Others",
    type: "expense",
    subcategories: [],
  },
];

const DEFAULT_INCOME_CATEGORIES = [
  {
    id: "salary",
    emoji: "💼",
    label: "Salary",
    type: "income",
    subcategories: ["Monthly", "Bonus", "Arrears"],
  },
  {
    id: "freelance",
    emoji: "💻",
    label: "Freelance",
    type: "income",
    subcategories: ["Project", "Consultation", "Contract"],
  },
  {
    id: "investment",
    emoji: "📈",
    label: "Investment",
    type: "income",
    subcategories: ["Stocks", "Mutual Funds", "FD Interest", "Dividends"],
  },
  {
    id: "transfer",
    emoji: "💸",
    label: "Transfer",
    type: "income",
    subcategories: ["Family", "Friends", "Refund"],
  },
  {
    id: "gift",
    emoji: "🎁",
    label: "Gift",
    type: "income",
    subcategories: ["Birthday", "Wedding", "Festival"],
  },
  {
    id: "business",
    emoji: "🏪",
    label: "Business",
    type: "income",
    subcategories: ["Sales", "Commission", "Profit"],
  },
  {
    id: "stipend",
    emoji: "🎓",
    label: "Stipend",
    type: "income",
    subcategories: ["Internship", "Scholarship"],
  },
  {
    id: "other_income",
    emoji: "💰",
    label: "Other",
    type: "income",
    subcategories: [],
  },
];

const CategoriesContext = createContext();

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem(CATEGORIES_KEY);
      if (stored) {
        setCategories(JSON.parse(stored));
      } else {
        const defaultCats = [
          ...DEFAULT_EXPENSE_CATEGORIES,
          ...DEFAULT_INCOME_CATEGORIES,
        ];
        setCategories(defaultCats);
        await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCats));
      }
    } catch (e) {
      console.log("Error loading categories:", e);
      setCategories([
        ...DEFAULT_EXPENSE_CATEGORIES,
        ...DEFAULT_INCOME_CATEGORIES,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveCategories = async (newCategories) => {
    setCategories(newCategories);
    try {
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCategories));
    } catch (e) {
      console.log("Error saving categories:", e);
    }
  };

  const addCategory = useCallback(
    async (category) => {
      const newCategory = {
        id: Date.now().toString(),
        emoji: category.emoji || "📌",
        label: category.label,
        type: category.type,
        subcategories: category.subcategories || [],
        isCustom: true,
      };
      const updated = [...categories, newCategory];
      await saveCategories(updated);
      return newCategory;
    },
    [categories],
  );

  const updateCategory = useCallback(
    async (id, updates) => {
      const updated = categories.map((cat) =>
        cat.id === id ? { ...cat, ...updates } : cat,
      );
      await saveCategories(updated);
    },
    [categories],
  );

  const deleteCategory = useCallback(
    async (id) => {
      const updated = categories.filter((cat) => cat.id !== id);
      await saveCategories(updated);
    },
    [categories],
  );

  const addSubcategory = useCallback(
    async (categoryId, subcategoryName) => {
      const updated = categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            subcategories: [...(cat.subcategories || []), subcategoryName],
          };
        }
        return cat;
      });
      await saveCategories(updated);
    },
    [categories],
  );

  const removeSubcategory = useCallback(
    async (categoryId, subcategoryName) => {
      const updated = categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            subcategories: (cat.subcategories || []).filter(
              (s) => s !== subcategoryName,
            ),
          };
        }
        return cat;
      });
      await saveCategories(updated);
    },
    [categories],
  );

  const getExpenseCategories = useCallback(() => {
    return categories.filter((c) => c.type === "expense");
  }, [categories]);

  const getIncomeCategories = useCallback(() => {
    return categories.filter((c) => c.type === "income");
  }, [categories]);

  const resetToDefaults = useCallback(async () => {
    const defaultCats = [
      ...DEFAULT_EXPENSE_CATEGORIES,
      ...DEFAULT_INCOME_CATEGORIES,
    ];
    await saveCategories(defaultCats);
  }, []);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        removeSubcategory,
        getExpenseCategories,
        getIncomeCategories,
        resetToDefaults,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
}
