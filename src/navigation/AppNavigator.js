import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import HomeScreen from "../screens/HomeScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
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
    name: "Goals",
    icon: "trophy",
    iconOutline: "trophy-outline",
    Screen: GoalsScreen,
  },
];

export default function AppNavigator({ expenseState, onAddExpense }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ focused, color, size }) => {
          const tab = TABS.find((t) => t.name === route.name);
          return (
            <Ionicons
              name={focused ? tab.icon : tab.iconOutline}
              size={22}
              color={color}
            />
          );
        },
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
            />
          )}
        />
      ))}
    </Tab.Navigator>
  );
}
