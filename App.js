import React, { useState, useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

import OnboardingScreen from "./src/screens/OnboardingScreen";
import AppNavigator from "./src/navigation/AppNavigator";
import AddExpenseModal from "./src/components/AddExpenseModal";
import { useExpenses } from "./src/hooks/useExpenses";
import { Colors, getColors } from "./src/theme/colors";
import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";
import { CategoriesProvider } from "./src/hooks/useCategories";
import { AccountsProvider } from "./src/hooks/useAccounts";
import { performAutomaticBackup } from "./src/utils/backupRestore";

const ONBOARDED_KEY = "dhanpath_rn_onboarded";

function AppContent() {
  const [onboarded, setOnboarded] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const expenseState = useExpenses();
  const { isDark, loading } = useTheme();
  const colors = getColors(isDark);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY).then((val) =>
      setOnboarded(val === "true"),
    );
    // Check and perform automatic backup if due
    performAutomaticBackup().catch((err) =>
      console.log("Auto backup check failed:", err),
    );
  }, []);

  const handleOnboardingDone = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, "true");
    setOnboarded(true);
  };

  const handleAddExpense = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleModalSave = (expense) => {
    expenseState.addExpense(expense);
    setModalVisible(false);
  };

  if (onboarded === null || loading)
    return (
      <View style={[styles.splash, { backgroundColor: colors.background }]} />
    );

  if (!onboarded) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <OnboardingScreen onDone={handleOnboardingDone} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <NavigationContainer>
        <AppNavigator
          expenseState={expenseState}
          onAddExpense={handleAddExpense}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </NavigationContainer>
      <AddExpenseModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSave={handleModalSave}
        selectedDate={selectedDate}
      />
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CategoriesProvider>
        <AccountsProvider>
          <AppContent />
        </AccountsProvider>
      </CategoriesProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: Colors.background },
});
