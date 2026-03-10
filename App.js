import React, { useState, useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

import OnboardingScreen from "./src/screens/OnboardingScreen";
import AppNavigator from "./src/navigation/AppNavigator";
import AddExpenseModal from "./src/components/AddExpenseModal";
import { useExpenses } from "./src/hooks/useExpenses";
import { Colors } from "./src/theme/colors";

const ONBOARDED_KEY = "dhanpath_rn_onboarded";

export default function App() {
  const [onboarded, setOnboarded] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const expenseState = useExpenses();

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY).then((val) =>
      setOnboarded(val === "true"),
    );
  }, []);

  const handleOnboardingDone = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, "true");
    setOnboarded(true);
  };

  if (onboarded === null) return <View style={styles.splash} />;

  if (!onboarded) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <OnboardingScreen onDone={handleOnboardingDone} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <NavigationContainer>
        <AppNavigator
          expenseState={expenseState}
          onAddExpense={() => setModalVisible(true)}
        />
      </NavigationContainer>
      <AddExpenseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(data) => expenseState.addTransaction(data)}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: Colors.background },
});
