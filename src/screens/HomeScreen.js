import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Gradients } from "../theme/colors";

const { width } = Dimensions.get("window");
const MONTHLY_BUDGET = 50000;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning ☀️";
  if (h < 17) return "Good Afternoon 🌤️";
  return "Good Evening 🌙";
}

function fmt(n) {
  return "₹" + Math.abs(n).toLocaleString("en-IN");
}

export default function HomeScreen({ expenseState, onAddExpense }) {
  const {
    balance = 0,
    totalIncome = 0,
    totalExpense = 0,
    transactions = [],
  } = expenseState;
  const [refreshing, setRefreshing] = useState(false);
  const budgetPct = Math.min((totalExpense / MONTHLY_BUDGET) * 100, 100);
  const safeToSpend = Math.max(MONTHLY_BUDGET - totalExpense, 0);
  const recent = transactions.slice(0, 5);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <LinearGradient
        colors={["#0d1b2e", Colors.background]}
        style={styles.header}
      >
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subGreeting}>DhanPath Smart Manager</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Balance Card */}
        <LinearGradient
          colors={Gradients.primary}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{fmt(balance)}</Text>
          <View style={styles.incExpRow}>
            <View style={styles.incExpItem}>
              <View style={styles.incExpIcon}>
                <Ionicons
                  name="arrow-down-circle"
                  size={18}
                  color={Colors.white}
                />
              </View>
              <View>
                <Text style={styles.incExpLabel}>Income</Text>
                <Text style={styles.incExpAmount}>{fmt(totalIncome)}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.incExpItem}>
              <View
                style={[
                  styles.incExpIcon,
                  { backgroundColor: "rgba(239,68,68,0.3)" },
                ]}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={18}
                  color={Colors.white}
                />
              </View>
              <View>
                <Text style={styles.incExpLabel}>Expense</Text>
                <Text style={styles.incExpAmount}>{fmt(totalExpense)}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Budget Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Monthly Budget</Text>
            <Text style={styles.cardSub}>{fmt(MONTHLY_BUDGET)}</Text>
          </View>
          <View style={styles.progressBg}>
            <LinearGradient
              colors={
                budgetPct > 80 ? ["#ef4444", "#dc2626"] : Gradients.primary
              }
              style={[styles.progressFill, { width: `${budgetPct}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetSpent}>
              Spent {fmt(totalExpense)} ({budgetPct.toFixed(0)}%)
            </Text>
            <Text style={styles.budgetSafe}>Safe {fmt(safeToSpend)}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickRow}>
          {[
            {
              label: "Add Expense",
              icon: "remove-circle",
              color: Colors.expense,
            },
            { label: "Add Income", icon: "add-circle", color: Colors.income },
            { label: "Transfer", icon: "swap-horizontal", color: Colors.info },
            { label: "Analytics", icon: "bar-chart", color: Colors.warning },
          ].map((q) => (
            <TouchableOpacity
              key={q.label}
              style={styles.quickItem}
              onPress={() =>
                q.label.includes("Expense") || q.label.includes("Income")
                  ? onAddExpense()
                  : null
              }
            >
              <View
                style={[styles.quickIcon, { backgroundColor: q.color + "22" }]}
              >
                <Ionicons name={q.icon} size={24} color={q.color} />
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Transactions</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          {recent.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>💸</Text>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            recent.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={styles.txEmoji}>
                  <Text style={{ fontSize: 22 }}>{tx.categoryEmoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txName}>{tx.name}</Text>
                  <Text style={styles.txDate}>
                    {new Date(tx.timestamp).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    {
                      color:
                        tx.txType === "income" ? Colors.income : Colors.expense,
                    },
                  ]}
                >
                  {tx.txType === "income" ? "+" : "-"}
                  {fmt(tx.amount)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={onAddExpense}
        activeOpacity={0.85}
        style={styles.fabWrap}
      >
        <LinearGradient
          colors={Gradients.primary}
          style={styles.fab}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={30} color={Colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: { fontSize: 20, fontWeight: "800", color: Colors.text },
  subGreeting: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  balanceCard: { borderRadius: 24, padding: 24, marginBottom: 16 },
  balanceLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.white,
    marginBottom: 20,
  },
  incExpRow: { flexDirection: "row", alignItems: "center" },
  incExpItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  incExpIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  incExpLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  incExpAmount: { fontSize: 15, fontWeight: "700", color: Colors.white },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 12,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: Colors.text },
  cardSub: { fontSize: 13, color: Colors.textSecondary },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
  progressBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: "100%", borderRadius: 6 },
  budgetRow: { flexDirection: "row", justifyContent: "space-between" },
  budgetSpent: { fontSize: 12, color: Colors.textSecondary },
  budgetSafe: { fontSize: 12, color: Colors.primary },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quickItem: { alignItems: "center", flex: 1 },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },
  quickLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  txEmoji: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  txDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 24 },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
  fabWrap: {
    position: "absolute",
    right: 20,
    bottom: 24,
    borderRadius: 28,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
