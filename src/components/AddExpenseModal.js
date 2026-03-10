import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Vibration,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors, Gradients } from "../theme/colors";

const { width, height } = Dimensions.get("window");

const CATEGORIES_EXPENSE = [
  { emoji: "🍕", label: "Food" },
  { emoji: "🛒", label: "Shopping" },
  { emoji: "🚗", label: "Transport" },
  { emoji: "⚡", label: "Bills" },
  { emoji: "🎬", label: "Entertainment" },
  { emoji: "💊", label: "Health" },
  { emoji: "📚", label: "Education" },
  { emoji: "✈️", label: "Travel" },
  { emoji: "🍺", label: "Social" },
  { emoji: "🏠", label: "Rent" },
  { emoji: "💇", label: "Personal" },
  { emoji: "🐾", label: "Others" },
];

const CATEGORIES_INCOME = [
  { emoji: "💼", label: "Salary" },
  { emoji: "💻", label: "Freelance" },
  { emoji: "📈", label: "Investment" },
  { emoji: "💸", label: "Transfer" },
  { emoji: "🎁", label: "Gift" },
  { emoji: "🏪", label: "Business" },
  { emoji: "🎓", label: "Stipend" },
  { emoji: "💰", label: "Other" },
];

const PAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

function getDateKey(date) {
  return date.toISOString().split("T")[0];
}

function formatDateShort(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (getDateKey(date) === getDateKey(today)) return "Today";
  if (getDateKey(date) === getDateKey(yesterday)) return "Yesterday";
  
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export default function AddExpenseModal({ visible, onClose, onSave, selectedDate }) {
  const [txType, setTxType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [txDate, setTxDate] = useState(selectedDate || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Update txDate when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setTxDate(selectedDate);
    }
  }, [selectedDate, visible]);

  const categories =
    txType === "expense" ? CATEGORIES_EXPENSE : CATEGORIES_INCOME;

  const handlePad = (key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === "⌫") {
      setAmount((a) => a.slice(0, -1));
    } else if (key === "." && amount.includes(".")) {
      return;
    } else if (amount.length >= 9) {
      return;
    } else {
      setAmount((a) => a + key);
    }
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) === 0 || !selectedCategory) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true);
    await new Promise((r) => setTimeout(r, 900));
    onSave({
      amount: parseFloat(amount),
      categoryEmoji: selectedCategory.emoji,
      categoryLabel: selectedCategory.label,
      name: selectedCategory.label,
      note,
      txType,
      date: getDateKey(txDate),
    });
    setSaved(false);
    setAmount("");
    setSelectedCategory(null);
    setNote("");
    setTxType("expense");
    setTxDate(selectedDate || new Date());
    onClose();
  };

  const reset = () => {
    setAmount("");
    setSelectedCategory(null);
    setNote("");
    setTxType("expense");
    setSaved(false);
    setTxDate(selectedDate || new Date());
    onClose();
  };

  const onDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setTxDate(date);
    }
  };

  const isIncome = txType === "income";
  const canSave = amount && parseFloat(amount) > 0 && selectedCategory;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={reset}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={reset} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Type toggle */}
          <View style={styles.toggleRow}>
            {["expense", "income"].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  setTxType(t);
                  setSelectedCategory(null);
                }}
                style={[
                  styles.toggleBtn,
                  txType === t &&
                    (t === "income"
                      ? styles.toggleIncome
                      : styles.toggleExpense),
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    txType === t && styles.toggleTextActive,
                  ]}
                >
                  {t === "income" ? "↓ Income" : "↑ Expense"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount display */}
          <View style={styles.amtWrap}>
            <Text style={styles.currency}>₹</Text>
            <Text
              style={[
                styles.amtText,
                { color: isIncome ? Colors.income : Colors.expense },
              ]}
            >
              {amount || "0"}
            </Text>
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.catScroll}
          >
            {categories.map((c) => (
              <TouchableOpacity
                key={c.label}
                onPress={() => setSelectedCategory(c)}
                style={[
                  styles.catBtn,
                  selectedCategory?.label === c.label &&
                    (isIncome
                      ? styles.catActiveIncome
                      : styles.catActiveExpense),
                ]}
              >
                <Text style={styles.catEmoji}>{c.emoji}</Text>
                <Text
                  style={[
                    styles.catLabel,
                    selectedCategory?.label === c.label && {
                      color: isIncome ? Colors.income : Colors.expense,
                    },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Note */}
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note (optional)..."
            placeholderTextColor={Colors.textMuted}
            value={note}
            onChangeText={setNote}
          />

          {/* Date Selector */}
          <TouchableOpacity 
            style={styles.dateBtn} 
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <Text style={styles.dateBtnText}>{formatDateShort(txDate)}</Text>
            <Text style={styles.dateBtnSub}>
              {txDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={txDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Numpad */}
          <View style={styles.numpad}>
            {PAD.map((k) => (
              <TouchableOpacity
                key={k}
                style={styles.padBtn}
                onPress={() => handlePad(k)}
                activeOpacity={0.7}
              >
                <Text style={styles.padText}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Save button */}
          {saved ? (
            <View style={styles.successBtn}>
              <Text style={styles.successText}>✅ Saved!</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleSave}
              disabled={!canSave}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  canSave
                    ? isIncome
                      ? Gradients.income
                      : Gradients.expense
                    : [Colors.border, Colors.border]
                }
                style={styles.saveBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text
                  style={[
                    styles.saveBtnText,
                    !canSave && { color: Colors.textMuted },
                  ]}
                >
                  {isIncome ? "Add Income" : "Add Expense"}
                  {selectedCategory ? ` · ${selectedCategory.emoji}` : ""}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  toggleRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
  },
  toggleExpense: {
    borderColor: Colors.expense,
    backgroundColor: Colors.expense + "22",
  },
  toggleIncome: {
    borderColor: Colors.income,
    backgroundColor: Colors.income + "22",
  },
  toggleText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary },
  toggleTextActive: { color: Colors.text },
  amtWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 16,
  },
  currency: { fontSize: 28, color: Colors.textSecondary, marginRight: 4 },
  amtText: { fontSize: 48, fontWeight: "800" },
  catScroll: { marginBottom: 12 },
  catBtn: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  catActiveExpense: {
    borderColor: Colors.expense,
    backgroundColor: Colors.expense + "18",
  },
  catActiveIncome: {
    borderColor: Colors.income,
    backgroundColor: Colors.income + "18",
  },
  catEmoji: { fontSize: 22, marginBottom: 3 },
  catLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: "500" },
  noteInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  dateBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  dateBtnSub: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  numpad: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14 },
  padBtn: { width: "33.33%", paddingVertical: 14, alignItems: "center" },
  padText: { fontSize: 22, fontWeight: "600", color: Colors.text },
  saveBtn: { borderRadius: 18, paddingVertical: 17, alignItems: "center" },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: Colors.white },
  successBtn: {
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: "center",
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  successText: { fontSize: 16, fontWeight: "700", color: Colors.primary },
});
