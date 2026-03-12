import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getColors } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import { useAccounts } from "../hooks/useAccounts";
import AccountManager from "../components/AccountManager";

function AccountsScreen() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { accounts, setDefaultAccount, deleteAccount } = useAccounts();
  const [showAccountManager, setShowAccountManager] = useState(false);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0),
    [accounts],
  );

  const formatBalance = useCallback((balance) => {
    const num = balance || 0;
    return num >= 0
      ? `₹${num.toLocaleString("en-IN")}`
      : `-₹${Math.abs(num).toLocaleString("en-IN")}`;
  }, []);

  const handleSetDefault = useCallback(
    (account) => {
      setDefaultAccount(account.id);
    },
    [setDefaultAccount],
  );

  const handleDeleteAccount = useCallback(
    (account) => {
      if (account.isDefault) {
        Alert.alert(
          "Cannot Delete",
          "Cannot delete the default account. Set another account as default first.",
        );
        return;
      }

      Alert.alert(
        "Delete Account",
        `Are you sure you want to delete "${account.label}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteAccount(account.id),
          },
        ],
      );
    },
    [deleteAccount],
  );

  const getAccountTypeIcon = (type) => {
    switch (type) {
      case "cash":
        return "cash-outline";
      case "bank":
        return "business-outline";
      case "card":
        return "card-outline";
      case "savings":
        return "trending-up-outline";
      case "wallet":
        return "wallet-outline";
      default:
        return "ellipse-outline";
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Accounts</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowAccountManager(true)}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Total Balance Card */}
      <View style={[styles.totalCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
          Total Balance
        </Text>
        <Text
          style={[
            styles.totalAmount,
            { color: totalBalance >= 0 ? colors.income : colors.expense },
          ]}
        >
          {formatBalance(totalBalance)}
        </Text>
        <Text style={[styles.accountCount, { color: colors.textMuted }]}>
          {accounts.length} account{accounts.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Accounts List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {accounts.map((account) => (
          <TouchableOpacity
            key={account.id}
            style={[
              styles.accountCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => setShowAccountManager(true)}
            onLongPress={() => handleSetDefault(account)}
          >
            <View style={styles.accountLeft}>
              <View
                style={[styles.iconWrap, { backgroundColor: colors.surface }]}
              >
                <Text style={styles.accountEmoji}>{account.emoji}</Text>
              </View>
              <View style={styles.accountInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.accountName, { color: colors.text }]}>
                    {account.label}
                  </Text>
                  {account.isDefault && (
                    <View
                      style={[
                        styles.defaultBadge,
                        { backgroundColor: colors.primaryGlow },
                      ]}
                    >
                      <Text
                        style={[styles.defaultText, { color: colors.primary }]}
                      >
                        Default
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.typeRow}>
                  <Ionicons
                    name={getAccountTypeIcon(account.type)}
                    size={12}
                    color={colors.textMuted}
                  />
                  <Text
                    style={[styles.accountType, { color: colors.textMuted }]}
                  >
                    {account.type?.charAt(0).toUpperCase() +
                      account.type?.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.accountRight}>
              <Text
                style={[
                  styles.balance,
                  {
                    color:
                      (account.balance || 0) >= 0
                        ? colors.income
                        : colors.expense,
                  },
                ]}
              >
                {formatBalance(account.balance)}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </View>
          </TouchableOpacity>
        ))}

        {/* Quick Tips */}
        <View style={[styles.tipCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="bulb-outline" size={18} color={colors.primary} />
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            Long press on an account to set it as default
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Account Manager Modal */}
      <AccountManager
        visible={showAccountManager}
        onClose={() => setShowAccountManager(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  totalCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "800",
  },
  accountCount: {
    fontSize: 12,
    marginTop: 6,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  accountEmoji: {
    fontSize: 24,
  },
  accountInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: "700",
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  accountType: {
    fontSize: 12,
  },
  accountRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balance: {
    fontSize: 16,
    fontWeight: "700",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  tipText: {
    fontSize: 12,
    flex: 1,
  },
});

export default React.memo(AccountsScreen);
