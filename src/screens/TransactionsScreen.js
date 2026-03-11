import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  PanResponder,
  StatusBar,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getColors } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";

const FILTERS = ["All", "Income", "Expense"];
const DELETE_WIDTH = 72;

const SwipeRow = React.memo(({ tx, onDelete, colors }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowOpen = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) translateX.setValue(Math.max(g.dx, -DELETE_WIDTH - 10));
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -DELETE_WIDTH / 2) {
          Animated.spring(translateX, {
            toValue: -DELETE_WIDTH,
            useNativeDriver: true,
          }).start();
          rowOpen.current = true;
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          rowOpen.current = false;
        }
      },
    }),
  ).current;

  const handleDelete = () => {
    Alert.alert("Delete Transaction", `Delete "${tx.name}"?`, [
      {
        text: "Cancel",
        onPress: () =>
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start(),
      },
      { text: "Delete", style: "destructive", onPress: () => onDelete(tx.id) },
    ]);
  };

  return (
    <View style={styles.rowContainer}>
      {/* Delete background */}
      <TouchableOpacity
        style={[styles.deleteBg, { backgroundColor: colors.expense }]}
        onPress={handleDelete}
      >
        <Ionicons name="trash" size={22} color={colors.white} />
        <Text style={[styles.deleteText, { color: colors.white }]}>Delete</Text>
      </TouchableOpacity>
      {/* Swipeable row */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.txRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.emojiBox, { backgroundColor: colors.surface }]}>
            <Text style={{ fontSize: 22 }}>{tx.categoryEmoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.txName, { color: colors.text }]}>
              {tx.name}
            </Text>
            <Text style={[styles.txDate, { color: colors.textSecondary }]}>
              {new Date(tx.timestamp).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={[
                styles.txAmount,
                {
                  color:
                    tx.txType === "income" ? colors.income : colors.expense,
                },
              ]}
            >
              {tx.txType === "income" ? "+" : "-"}₹
              {tx.amount.toLocaleString("en-IN")}
            </Text>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    tx.txType === "income"
                      ? colors.income + "22"
                      : colors.expense + "22",
                },
              ]}
            >
              <Text
                style={[
                  styles.typeBadgeText,
                  {
                    color:
                      tx.txType === "income" ? colors.income : colors.expense,
                  },
                ]}
              >
                {tx.txType === "income" ? "Income" : "Expense"}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
});

function TransactionsScreen({ expenseState }) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { transactions = [], deleteTransaction } = expenseState;
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (activeFilter === "Income" && tx.txType !== "income") return false;
      if (activeFilter === "Expense" && tx.txType !== "expense") return false;
      if (search && !tx.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [transactions, activeFilter, search]);

  const keyExtractor = useCallback((tx) => tx.id, []);

  const renderItem = useCallback(
    ({ item }) => (
      <SwipeRow tx={item} onDelete={deleteTransaction} colors={colors} />
    ),
    [deleteTransaction, colors],
  );

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.empty}>
        <Text style={{ fontSize: 40 }}>🔍</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No transactions found
        </Text>
      </View>
    ),
    [colors.textSecondary],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {filtered.length} entries
        </Text>
      </View>

      {/* Search */}
      <View
        style={[
          styles.searchBox,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[
              styles.filterBtn,
              { borderColor: colors.border },
              activeFilter === f && {
                backgroundColor: colors.primaryGlow,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: colors.textSecondary },
                activeFilter === f && {
                  color: colors.primary,
                  fontWeight: "700",
                },
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(tx) => tx.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No transactions found
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <SwipeRow tx={item} onDelete={deleteTransaction} colors={colors} />
        )}
      />
    </View>
  );
}

export default React.memo(TransactionsScreen);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 22, fontWeight: "800" },
  count: { fontSize: 13 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: "500" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  rowContainer: {
    marginBottom: 10,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  deleteBg: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  deleteText: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  emojiBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txName: { fontSize: 14, fontWeight: "600" },
  txDate: { fontSize: 11, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "700" },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  typeBadgeText: { fontSize: 10, fontWeight: "600" },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 14, marginTop: 10 },
});
