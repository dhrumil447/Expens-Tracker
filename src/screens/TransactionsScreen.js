import React, { useState, useRef } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";

const FILTERS = ["All", "Income", "Expense"];
const DELETE_WIDTH = 72;

function SwipeRow({ tx, onDelete }) {
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
      <TouchableOpacity style={styles.deleteBg} onPress={handleDelete}>
        <Ionicons name="trash" size={22} color={Colors.white} />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
      {/* Swipeable row */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        <View style={styles.txRow}>
          <View style={styles.emojiBox}>
            <Text style={{ fontSize: 22 }}>{tx.categoryEmoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.txName}>{tx.name}</Text>
            <Text style={styles.txDate}>
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
                    tx.txType === "income" ? Colors.income : Colors.expense,
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
                      ? Colors.income + "22"
                      : Colors.expense + "22",
                },
              ]}
            >
              <Text
                style={[
                  styles.typeBadgeText,
                  {
                    color:
                      tx.txType === "income" ? Colors.income : Colors.expense,
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
}

export default function TransactionsScreen({ expenseState }) {
  const { transactions = [], deleteTransaction } = expenseState;
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((tx) => {
    if (activeFilter === "Income" && tx.txType !== "income") return false;
    if (activeFilter === "Expense" && tx.txType !== "expense") return false;
    if (search && !tx.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.count}>{filtered.length} entries</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
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
              activeFilter === f && styles.filterBtnActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === f && styles.filterTextActive,
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
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <SwipeRow tx={item} onDelete={deleteTransaction} />
        )}
      />
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
    paddingBottom: 8,
  },
  title: { fontSize: 22, fontWeight: "800", color: Colors.text },
  count: { fontSize: 13, color: Colors.textSecondary },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
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
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  filterText: { fontSize: 13, color: Colors.textSecondary, fontWeight: "500" },
  filterTextActive: { color: Colors.primary, fontWeight: "700" },
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
    backgroundColor: Colors.expense,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  deleteText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emojiBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  txDate: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "700" },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  typeBadgeText: { fontSize: 10, fontWeight: "600" },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, marginTop: 10 },
});
