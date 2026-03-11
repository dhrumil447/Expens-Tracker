import React, { useMemo, useCallback } from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getColors } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import HomeScreen from "../screens/HomeScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import AccountsScreen from "../screens/AccountsScreen";
import GoalsScreen from "../screens/GoalsScreen";

const Tab = createBottomTabNavigator();

const TABS = [
  {
    name: "Home",
    icon: "home",
    iconOutline: "home-outline",
    Screen: HomeScreen,
  },
  {
    name: "Transactions",
    icon: "list",
    iconOutline: "list-outline",
    Screen: TransactionsScreen,
  },
  {
    name: "Analytics",
    icon: "bar-chart",
    iconOutline: "bar-chart-outline",
    Screen: AnalyticsScreen,
  },
  {
    name: "Accounts",
    icon: "wallet",
    iconOutline: "wallet-outline",
    Screen: AccountsScreen,
  },
  {
    name: "Goals",
    icon: "trophy",
    iconOutline: "trophy-outline",
    Screen: GoalsScreen,
  },
];

export default function AppNavigator({
  expenseState,
  onAddExpense,
  selectedDate,
  setSelectedDate,
}) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: 64,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
    }),
    [colors],
  );

  const tabBarIcon = useCallback(
    ({ route, focused, color, size }) => {
      const tab = TABS.find((t) => t.name === route.name);
      return (
        <Ionicons
          name={focused ? tab.icon : tab.iconOutline}
          size={22}
          color={color}
        />
      );
    },
    [],
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...screenOptions,
        tabBarIcon: ({ focused, color, size }) =>
          tabBarIcon({ route, focused, color, size }),
      })}
    >
      {TABS.map(({ name, Screen }) => (
        <Tab.Screen
          key={name}
          name={name}
          children={(props) => (
            <Screen
              {...props}
              expenseState={expenseState}
              onAddExpense={onAddExpense}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          )}
        />
      ))}
    </Tab.Navigator>
  );
}
