import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SimpleBarChart({ data, height = 200, colors }) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={{ color: colors.textSecondary }}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value));
  const barWidth = 100 / (data.length * 2);

  return (
    <View style={styles.chartContainer}>
      <View style={[styles.chart, { height }]}>
        {data.map((item, index) => {
          const barHeight =
            maxValue > 0 ? (item.value / maxValue) * (height - 40) : 0;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <Text
                  style={[styles.valueText, { color: colors.textSecondary }]}
                >
                  {item.value > 0 ? `₹${(item.value / 1000).toFixed(0)}k` : ""}
                </Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: item.color || colors.primary,
                      width: `${barWidth}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  chartContainer: {
    paddingVertical: 10,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 4,
  },
  bar: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 2,
  },
  valueText: {
    fontSize: 10,
    fontWeight: "600",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
  },
});
