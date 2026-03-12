import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Circle, Line } from "react-native-svg";

const { width } = Dimensions.get("window");

export default function SimpleLineChart({ data, height = 200, colors }) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={{ color: colors.textSecondary }}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const chartWidth = width - 80;
  const chartHeight = height - 40;
  const pointGap = chartWidth / (data.length - 1 || 1);

  // Create SVG path
  let pathD = "";
  let areaPathD = "";
  const points = [];

  data.forEach((item, index) => {
    const x = index * pointGap;
    const y = chartHeight - (item.value / maxValue) * chartHeight;
    points.push({ x, y, value: item.value });

    if (index === 0) {
      pathD = `M ${x} ${y}`;
      areaPathD = `M ${x} ${chartHeight} L ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
      areaPathD += ` L ${x} ${y}`;
    }
  });

  // Close area path
  areaPathD += ` L ${chartWidth} ${chartHeight} Z`;

  return (
    <View style={styles.chartContainer}>
      <Svg width={chartWidth} height={chartHeight} style={{ marginLeft: 20 }}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = (chartHeight / 4) * i;
          return (
            <Line
              key={i}
              x1="0"
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke={colors.border}
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.3"
            />
          );
        })}

        {/* Area under line */}
        <Path d={areaPathD} fill="rgba(59, 130, 246, 0.1)" />

        {/* Line */}
        <Path
          d={pathD}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="5"
            fill="#3b82f6"
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
      </Svg>

      {/* Labels */}
      <View style={styles.labelsContainer}>
        {data.map((item, index) => (
          <View
            key={index}
            style={[
              styles.labelWrapper,
              {
                width: chartWidth / data.length,
                marginLeft: index === 0 ? 20 : 0,
              },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {item.label}
            </Text>
          </View>
        ))}
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
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  labelWrapper: {
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
  },
});
