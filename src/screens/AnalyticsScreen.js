import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import { LineChart, PieChart, BarChart } from "react-native-chart-kit";
import { Colors } from "../theme/colors";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 40;

const chartConfig = {
  backgroundColor: Colors.card,
  backgroundGradientFrom: Colors.card,
  backgroundGradientTo: Colors.card,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(16,185,129,${opacity})`,
  labelColor: () => Colors.textSecondary,
  style: { borderRadius: 16 },
  propsForDots: { r: "4", strokeWidth: "2", stroke: Colors.primary },
  propsForBackgroundLines: { stroke: Colors.border },
};

export default function AnalyticsScreen({ expenseState }) {
  const {
    transactions = [],
    totalIncome = 0,
    totalExpense = 0,
    balance = 0,
  } = expenseState;

  // Monthly spend for last 6 months
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const spendByMonth = [
    8200,
    12400,
    9800,
    14300,
    totalExpense > 0 ? totalExpense : 11200,
    0,
  ];

  // Category breakdown
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
      legendFontColor: Colors.textSecondary,
      legendFontSize: 12,
    }));

  const savingsRate =
    totalIncome > 0
      ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)
      : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.title}>Analytics</Text>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {[
            { label: "Income", amount: totalIncome, color: Colors.income },
            { label: "Expense", amount: totalExpense, color: Colors.expense },
            { label: "Savings", amount: balance, color: Colors.info },
          ].map((s) => (
            <View key={s.label} style={styles.sumCard}>
              <Text style={[styles.sumAmount, { color: s.color }]}>
                ₹{Math.abs(s.amount).toLocaleString("en-IN")}
              </Text>
              <Text style={styles.sumLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Savings Rate */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Savings Rate</Text>
          <View style={styles.rateRow}>
            <Text style={styles.rateNum}>{savingsRate}%</Text>
            <Text style={styles.rateDesc}>
              {savingsRate >= 20
                ? "🎉 Excellent saving habit!"
                : savingsRate >= 10
                  ? "👍 Good, aim for 20%+"
                  : "⚠️ Try to save more"}
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(savingsRate, 100)}%`,
                  backgroundColor:
                    savingsRate >= 20 ? Colors.income : Colors.warning,
                },
              ]}
            />
          </View>
        </View>

        {/* Spending Trend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending Trend</Text>
          <LineChart
            data={{ labels: months, datasets: [{ data: spendByMonth }] }}
            width={CHART_WIDTH - 36}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 12, marginTop: 8 }}
          />
        </View>

        {/* Category Breakdown */}
        {pieData.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>By Category</Text>
            <PieChart
              data={pieData}
              width={CHART_WIDTH - 36}
              height={180}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="8"
              center={[0, 0]}
              absolute
            />
          </View>
        )}

        {/* Bar chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Comparison</Text>
          <BarChart
            data={{
              labels: months.slice(0, 5),
              datasets: [{ data: spendByMonth.slice(0, 5) }],
            }}
            width={CHART_WIDTH - 36}
            height={180}
            chartConfig={{
              ...chartConfig,
              color: (o = 1) => `rgba(59,130,246,${o})`,
            }}
            style={{ borderRadius: 12, marginTop: 8 }}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 16,
  },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  sumCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sumAmount: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  sumLabel: { fontSize: 11, color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 10,
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  rateNum: { fontSize: 32, fontWeight: "800", color: Colors.primary },
  rateDesc: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  progressBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 6 },
});
