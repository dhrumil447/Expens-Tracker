import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
// import { LineChart, PieChart, BarChart } from "react-native-chart-kit"; // Temporarily disabled
import { getColors } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 40;

function AnalyticsScreen({ expenseState }) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  const chartConfig = useMemo(
    () => ({
      backgroundColor: colors.card,
      backgroundGradientFrom: colors.card,
      backgroundGradientTo: colors.card,
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(16,185,129,${opacity})`,
      labelColor: () => colors.textSecondary,
      style: { borderRadius: 16 },
      propsForDots: { r: "4", strokeWidth: "2", stroke: colors.primary },
      propsForBackgroundLines: { stroke: colors.border },
    }),
    [colors],
  );

  const {
    transactions = [],
    totalIncome = 0,
    totalExpense = 0,
    balance = 0,
  } = expenseState;

  // Monthly spend for last 6 months
  const months = useMemo(() => ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"], []);
  const spendByMonth = useMemo(
    () => [
      8200,
      12400,
      9800,
      14300,
      totalExpense > 0 ? totalExpense : 11200,
      0,
    ],
    [totalExpense],
  );

  // Category breakdown
  const { categoryMap, pieData } = useMemo(() => {
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
      .slice(0, 6)
      .map(([name, amount], i) => ({
        name,
        amount,
        color: pieColors[i % pieColors.length],
        legendFontColor: colors.textSecondary,
        legendFontSize: 12,
      }));

    return { categoryMap, pieData };
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
          <View
            style={{
              height: 180,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.textSecondary }}>
              Chart temporarily unavailable
            </Text>
          </View>
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
              By Category
            </Text>
            <View
              style={{
                height: 180,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.textSecondary }}>
                Chart temporarily unavailable
              </Text>
            </View>
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
            Monthly Comparison
          </Text>
          <View
            style={{
              height: 180,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.textSecondary }}>
              Chart temporarily unavailable
            </Text>
          </View>
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
