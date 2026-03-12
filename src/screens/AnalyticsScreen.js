import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import SimpleLineChart from "../components/SimpleLineChart";
import SimplePieChart from "../components/SimplePieChart";
import SimpleBarChart from "../components/SimpleBarChart";
import { getColors } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 40;

function AnalyticsScreen({ expenseState }) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  const {
    transactions = [],
    totalIncome = 0,
    totalExpense = 0,
    balance = 0,
  } = expenseState;

  // Monthly spend for last 6 months - calculate from real data
  const { months, lineData, spendByMonth } = useMemo(() => {
    const now = new Date();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const months = [];
    const spendByMonth = [];
    const lineData = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = monthNames[d.getMonth()];
      months.push(monthLabel);

      // Calculate spending for this month
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const monthEnd = new Date(
        d.getFullYear(),
        d.getMonth() + 1,
        0,
        23,
        59,
        59,
      ).getTime();

      const monthSpend = transactions
        .filter(
          (t) =>
            t.txType === "expense" &&
            t.timestamp >= monthStart &&
            t.timestamp <= monthEnd,
        )
        .reduce((sum, t) => sum + t.amount, 0);

      spendByMonth.push(monthSpend || 0);
      lineData.push({
        value: monthSpend || 0,
        label: monthLabel,
        dataPointText:
          monthSpend > 0 ? `₹${(monthSpend / 1000).toFixed(0)}k` : "",
      });
    }

    // Ensure at least some data for demo
    if (spendByMonth.every((val) => val === 0)) {
      const demoValue = totalExpense || 5000;
      spendByMonth[spendByMonth.length - 1] = demoValue;
      lineData[lineData.length - 1].value = demoValue;
      lineData[lineData.length - 1].dataPointText =
        `₹${(demoValue / 1000).toFixed(0)}k`;
    }

    return { months, lineData, spendByMonth };
  }, [transactions, totalExpense]);

  // Income vs Expense by month
  const barData = useMemo(() => {
    const now = new Date();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const incomeData = [];
    const expenseData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const monthEnd = new Date(
        d.getFullYear(),
        d.getMonth() + 1,
        0,
        23,
        59,
        59,
      ).getTime();

      const monthIncome = transactions
        .filter(
          (t) =>
            t.txType === "income" &&
            t.timestamp >= monthStart &&
            t.timestamp <= monthEnd,
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpense = transactions
        .filter(
          (t) =>
            t.txType === "expense" &&
            t.timestamp >= monthStart &&
            t.timestamp <= monthEnd,
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const monthLabel = monthNames[d.getMonth()];

      incomeData.push({
        value: monthIncome || 0,
        label: monthLabel,
        color: "#10b981",
      });

      expenseData.push({
        value: monthExpense || 0,
        label: monthLabel,
        color: "#ef4444",
      });
    }

    return { incomeData, expenseData };
  }, [transactions]);

  // Category breakdown
  const pieData = useMemo(() => {
    const categoryMap = {};
    transactions
      .filter((t) => t.txType === "expense")
      .forEach((t) => {
        const key = t.categoryLabel || "Other";
        categoryMap[key] = (categoryMap[key] || 0) + t.amount;
      });

    const pieColors = [
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
    ];

    const pieData = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, amount], i) => ({
        value: amount,
        color: pieColors[i % pieColors.length],
        text: name,
        textColor: colors.textSecondary,
      }));

    return pieData;
  }, [transactions, colors.textSecondary]);

  const savingsRate = useMemo(
    () =>
      totalIncome > 0
        ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)
        : 0,
    [totalIncome, totalExpense],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {[
            { label: "Income", amount: totalIncome, color: colors.income },
            { label: "Expense", amount: totalExpense, color: colors.expense },
            { label: "Savings", amount: balance, color: colors.info },
          ].map((s) => (
            <View
              key={s.label}
              style={[
                styles.sumCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sumAmount, { color: s.color }]}>
                ₹{Math.abs(s.amount).toLocaleString("en-IN")}
              </Text>
              <Text style={[styles.sumLabel, { color: colors.textSecondary }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Savings Rate */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Savings Rate
          </Text>
          <View style={styles.rateRow}>
            <Text style={[styles.rateNum, { color: colors.primary }]}>
              {savingsRate}%
            </Text>
            <Text style={[styles.rateDesc, { color: colors.textSecondary }]}>
              {savingsRate >= 20
                ? "🎉 Excellent saving habit!"
                : savingsRate >= 10
                  ? "👍 Good, aim for 20%+"
                  : "⚠️ Try to save more"}
            </Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(savingsRate, 100)}%`,
                  backgroundColor:
                    savingsRate >= 20 ? colors.income : colors.warning,
                },
              ]}
            />
          </View>
        </View>

        {/* Spending Trend */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Spending Trend
          </Text>
          {lineData.some((item) => item.value > 0) ? (
            <SimpleLineChart data={lineData} height={200} colors={colors} />
          ) : (
            <View
              style={{
                height: 180,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.textSecondary }}>
                No spending data available
              </Text>
            </View>
          )}
        </View>

        {/* Category Breakdown */}
        {pieData.length > 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Expenses by Category
            </Text>
            <SimplePieChart data={pieData} radius={90} colors={colors} />
          </View>
        )}

        {/* Bar chart */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Income vs Expense
          </Text>
          {barData.incomeData.some((item) => item.value > 0) ||
          barData.expenseData.some((item) => item.value > 0) ? (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginBottom: 10,
                  gap: 20,
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      backgroundColor: "#10b981",
                    }}
                  />
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    Income
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      backgroundColor: "#ef4444",
                    }}
                  />
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    Expense
                  </Text>
                </View>
              </View>
              <SimpleBarChart
                data={barData.incomeData}
                height={200}
                colors={colors}
              />
            </View>
          ) : (
            <View
              style={{
                height: 180,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.textSecondary }}>
                No data available
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

export default React.memo(AnalyticsScreen);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
  },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  sumCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  sumAmount: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  sumLabel: { fontSize: 11 },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  rateNum: { fontSize: 32, fontWeight: "800" },
  rateDesc: { fontSize: 13, flex: 1 },
  progressBg: {
    height: 8,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 6 },
});
