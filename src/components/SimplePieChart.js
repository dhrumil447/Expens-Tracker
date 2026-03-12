import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path, G } from "react-native-svg";

export default function SimplePieChart({ data, radius = 80, colors }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.textSecondary }}>No data available</Text>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = radius + 10;
  const centerY = radius + 10;

  // Calculate pie slices
  let currentAngle = -90; // Start from top
  const slices = data.map((item) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      percentage: (percentage * 100).toFixed(1),
      startAngle,
      endAngle,
    };
  });

  // Create SVG path for donut slice
  const createArc = (startAngle, endAngle, innerRadius, outerRadius) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + outerRadius * Math.cos(startRad);
    const y1 = centerY + outerRadius * Math.sin(startRad);
    const x2 = centerX + outerRadius * Math.cos(endRad);
    const y2 = centerY + outerRadius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  };

  return (
    <View style={styles.container}>
      <Svg width={radius * 2 + 20} height={radius * 2 + 20}>
        <G>
          {slices.map((slice, index) => (
            <Path
              key={index}
              d={createArc(
                slice.startAngle,
                slice.endAngle,
                radius * 0.6,
                radius,
              )}
              fill={slice.color}
            />
          ))}
          {/* Center circle */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.6}
            fill={colors.card}
          />
        </G>
      </Svg>

      {/* Center label */}
      <View style={styles.centerLabel}>
        <Text style={[styles.centerNumber, { color: colors.text }]}>
          {data.length}
        </Text>
        <Text style={[styles.centerText, { color: colors.textSecondary }]}>
          Categories
        </Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: item.color }]}
            />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
              {item.text}
            </Text>
            <Text style={[styles.legendValue, { color: colors.text }]}>
              ₹{item.value.toLocaleString("en-IN")}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 10,
  },
  centerLabel: {
    position: "absolute",
    top: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  centerNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  centerText: {
    fontSize: 12,
    marginTop: 2,
  },
  legend: {
    marginTop: 20,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
  },
  legendValue: {
    fontSize: 13,
    fontWeight: "600",
  },
});
