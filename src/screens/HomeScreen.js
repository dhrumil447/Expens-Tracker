import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  RefreshControl,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors, Gradients, getColors, getGradients } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import SettingsModal from "../components/SettingsModal";

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

function getDateKey(date) {
  return date.toISOString().split("T")[0];
}

function formatDateDisplay(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (getDateKey(date) === getDateKey(today)) return "Today";
  if (getDateKey(date) === getDateKey(yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function HomeScreen({
  expenseState,
  onAddExpense,
  selectedDate,
  setSelectedDate,
}) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const gradients = getGradients(isDark);

  const {
    balance = 0,
    totalIncome = 0,
    totalExpense = 0,
    transactions = [],
  } = expenseState;
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Filter transactions by selected date
  const selectedDateKey = getDateKey(selectedDate);
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = tx.date || getDateKey(new Date(tx.timestamp));
      return txDate === selectedDateKey;
    });
  }, [transactions, selectedDateKey]);

  // Calculate totals for selected date
  const dailyIncome = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.txType === "income")
        .reduce((s, t) => s + t.amount, 0),
    [filteredTransactions],
  );

  const dailyExpense = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.txType === "expense")
        .reduce((s, t) => s + t.amount, 0),
    [filteredTransactions],
  );

  const budgetPct = useMemo(
    () => Math.min((totalExpense / MONTHLY_BUDGET) * 100, 100),
    [totalExpense],
  );

  const safeToSpend = useMemo(
    () => Math.max(MONTHLY_BUDGET - totalExpense, 0),
    [totalExpense],
  );

  const recent = useMemo(
    () => filteredTransactions.slice(0, 5),
    [filteredTransactions],
  );

  const changeDate = useCallback(
    (days) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + days);
      setSelectedDate(newDate);
    },
    [selectedDate, setSelectedDate],
  );

  const onDateChange = useCallback(
    (event, date) => {
      setShowDatePicker(Platform.OS === "ios");
      if (date) {
        setSelectedDate(date);
      }
    },
    [setSelectedDate],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <LinearGradient colors={gradients.header} style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
            DhanPath Smart Manager
          </Text>
        </View>
        <View style={styles.headerBtns}>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: colors.card }]}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: colors.card }]}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Date Selector */}
      <View
        style={[
          styles.dateSelector,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.dateArrow, { backgroundColor: colors.surface }]}
          onPress={() => changeDate(-1)}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateDisplay}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDateDisplay(selectedDate)}
          </Text>
          <Text style={[styles.dateSubText, { color: colors.textSecondary }]}>
            {selectedDate.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dateArrow, { backgroundColor: colors.surface }]}
          onPress={() => changeDate(1)}
          disabled={getDateKey(selectedDate) === getDateKey(new Date())}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={
              getDateKey(selectedDate) === getDateKey(new Date())
                ? colors.textMuted
                : colors.primary
            }
          />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Balance Card */}
        <LinearGradient
          colors={gradients.primary}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{fmt(balance)}</Text>
          <View style={styles.dailyLabel}>
            <Text style={styles.dailyText}>
              📅 {formatDateDisplay(selectedDate)}'s Summary
            </Text>
          </View>
          <View style={styles.incExpRow}>
            <View style={styles.incExpItem}>
              <View style={styles.incExpIcon}>
                <Ionicons
                  name="arrow-down-circle"
                  size={18}
                  color={colors.white}
                />
              </View>
              <View>
                <Text style={styles.incExpLabel}>Income</Text>
                <Text style={styles.incExpAmount}>{fmt(dailyIncome)}</Text>
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
                  color={colors.white}
                />
              </View>
              <View>
                <Text style={styles.incExpLabel}>Expense</Text>
                <Text style={styles.incExpAmount}>{fmt(dailyExpense)}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Budget Progress */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Monthly Budget
            </Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
              {fmt(MONTHLY_BUDGET)}
            </Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
            <LinearGradient
              colors={
                budgetPct > 80 ? ["#ef4444", "#dc2626"] : gradients.primary
              }
              style={[styles.progressFill, { width: `${budgetPct}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <View style={styles.budgetRow}>
            <Text style={[styles.budgetSpent, { color: colors.textSecondary }]}>
              Spent {fmt(totalExpense)} ({budgetPct.toFixed(0)}%)
            </Text>
            <Text style={[styles.budgetSafe, { color: colors.primary }]}>
              Safe {fmt(safeToSpend)}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickRow}>
          {[
            {
              label: "Add Expense",
              icon: "remove-circle",
              color: colors.expense,
            },
            { label: "Add Income", icon: "add-circle", color: colors.income },
            { label: "Transfer", icon: "swap-horizontal", color: colors.info },
            { label: "Analytics", icon: "bar-chart", color: colors.warning },
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
              <Text
                style={[styles.quickLabel, { color: colors.textSecondary }]}
              >
                {q.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Recent Transactions
            </Text>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              See All
            </Text>
          </View>
          {recent.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>💸</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No transactions yet
              </Text>
            </View>
          ) : (
            recent.map((tx) => (
              <View
                key={tx.id}
                style={[styles.txRow, { borderBottomColor: colors.border }]}
              >
                <View
                  style={[styles.txEmoji, { backgroundColor: colors.surface }]}
                >
                  <Text style={{ fontSize: 22 }}>{tx.categoryEmoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.txName, { color: colors.text }]}>
                    {tx.name}
                  </Text>
                  <Text
                    style={[styles.txDate, { color: colors.textSecondary }]}
                  >
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
                        tx.txType === "income" ? colors.income : colors.expense,
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
        style={[styles.fabWrap, { shadowColor: colors.primary }]}
      >
        <LinearGradient
          colors={gradients.primary}
          style={styles.fab}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={30} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </View>
  );
}

export default React.memo(HomeScreen);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: { fontSize: 20, fontWeight: "800" },
  subGreeting: { fontSize: 12, marginTop: 2 },
  headerBtns: {
    flexDirection: "row",
    gap: 8,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    color: "#ffffff",
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
  incExpAmount: { fontSize: 15, fontWeight: "700", color: "#ffffff" },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 12,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  cardSub: { fontSize: 13 },
  seeAll: { fontSize: 13, fontWeight: "600" },
  progressBg: {
    height: 8,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: "100%", borderRadius: 6 },
  budgetRow: { flexDirection: "row", justifyContent: "space-between" },
  budgetSpent: { fontSize: 12 },
  budgetSafe: { fontSize: 12 },
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
    textAlign: "center",
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  txEmoji: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txName: { fontSize: 14, fontWeight: "600" },
  txDate: { fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 24 },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14 },
  fabWrap: {
    position: "absolute",
    right: 20,
    bottom: 24,
    borderRadius: 28,
    elevation: 8,
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
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  dateArrow: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dateDisplay: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "700",
  },
  dateSubText: {
    fontSize: 12,
  },
  dailyLabel: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  dailyText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
});
