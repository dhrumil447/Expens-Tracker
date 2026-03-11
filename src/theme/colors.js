// Dark Theme Colors
export const DarkColors = {
  background: "#0a0f1a",
  surface: "#111827",
  card: "#1a2235",
  border: "#1e2d40",

  primary: "#10b981",
  primaryDark: "#059669",
  primaryLight: "#34d399",
  primaryGlow: "rgba(16,185,129,0.18)",

  income: "#10b981",
  expense: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",

  text: "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted: "#475569",

  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
};

// Light Theme Colors
export const LightColors = {
  background: "#f8fafc",
  surface: "#ffffff",
  card: "#ffffff",
  border: "#e2e8f0",

  primary: "#10b981",
  primaryDark: "#059669",
  primaryLight: "#34d399",
  primaryGlow: "rgba(16,185,129,0.12)",

  income: "#10b981",
  expense: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",

  text: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",

  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
};

// Default export (for backward compatibility)
export const Colors = DarkColors;

// Function to get colors based on theme
export const getColors = (isDark) => (isDark ? DarkColors : LightColors);

// Dark Theme Gradients
export const DarkGradients = {
  primary: ["#10b981", "#14b8a6"],
  card: ["#1a2235", "#111827"],
  background: ["#0a0f1a", "#111827"],
  income: ["#10b981", "#059669"],
  expense: ["#ef4444", "#dc2626"],
  goal: ["#6366f1", "#8b5cf6"],
  header: ["#0d1b2e", "#0a0f1a"],
};

// Light Theme Gradients
export const LightGradients = {
  primary: ["#10b981", "#14b8a6"],
  card: ["#ffffff", "#f8fafc"],
  background: ["#f8fafc", "#f1f5f9"],
  income: ["#10b981", "#059669"],
  expense: ["#ef4444", "#dc2626"],
  goal: ["#6366f1", "#8b5cf6"],
  header: ["#f1f5f9", "#f8fafc"],
};

// Default export (for backward compatibility)
export const Gradients = DarkGradients;

// Function to get gradients based on theme
export const getGradients = (isDark) =>
  isDark ? DarkGradients : LightGradients;
