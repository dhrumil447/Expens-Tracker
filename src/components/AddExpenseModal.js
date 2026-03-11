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
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors, Gradients, getColors, getGradients } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import { useCategories } from "../hooks/useCategories";
import { useAccounts } from "../hooks/useAccounts";

const { width, height } = Dimensions.get("window");

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

export default function AddExpenseModal({
  visible,
  onClose,
  onSave,
  selectedDate,
}) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const gradients = getGradients(isDark);
  const { getExpenseCategories, getIncomeCategories } = useCategories();
  const { accounts, getDefaultAccount } = useAccounts();

  const [txType, setTxType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [txDate, setTxDate] = useState(selectedDate || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Set default account on mount
  useEffect(() => {
    if (!selectedAccount && accounts.length > 0) {
      setSelectedAccount(getDefaultAccount());
    }
  }, [accounts]);

  // Update txDate when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setTxDate(selectedDate);
    }
  }, [selectedDate, visible]);

  const categories =
    txType === "expense" ? getExpenseCategories() : getIncomeCategories();

  const handlePad = (key) => {
    Vibration.vibrate(10);
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
    Vibration.vibrate(50);
    setSaved(true);
    await new Promise((r) => setTimeout(r, 900));
    onSave({
      amount: parseFloat(amount),
      categoryEmoji: selectedCategory.emoji,
      categoryLabel: selectedCategory.label,
      subcategory: selectedSubcategory || null,
      name: selectedSubcategory || selectedCategory.label,
      note,
      txType,
      date: getDateKey(txDate),
      accountId: selectedAccount?.id,
      accountLabel: selectedAccount?.label,
      accountEmoji: selectedAccount?.emoji,
    });
    setSaved(false);
    setAmount("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedAccount(getDefaultAccount());
    setNote("");
    setTxType("expense");
    setTxDate(selectedDate || new Date());
    onClose();
  };

  const reset = () => {
    setAmount("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedAccount(getDefaultAccount());
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
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

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
                  { borderColor: colors.border },
                  txType === t &&
                    (t === "income"
                      ? {
                          borderColor: colors.income,
                          backgroundColor: colors.income + "22",
                        }
                      : {
                          borderColor: colors.expense,
                          backgroundColor: colors.expense + "22",
                        }),
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: colors.textSecondary },
                    txType === t && { color: colors.text },
                  ]}
                >
                  {t === "income" ? "↓ Income" : "↑ Expense"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount display */}
          <View style={styles.amtWrap}>
            <Text style={[styles.currency, { color: colors.textSecondary }]}>
              ₹
            </Text>
            <Text
              style={[
                styles.amtText,
                { color: isIncome ? colors.income : colors.expense },
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
                onPress={() => {
                  setSelectedCategory(c);
                  setSelectedSubcategory(null);
                }}
                style={[
                  styles.catBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                  selectedCategory?.label === c.label &&
                    (isIncome
                      ? {
                          borderColor: colors.income,
                          backgroundColor: colors.income + "18",
                        }
                      : {
                          borderColor: colors.expense,
                          backgroundColor: colors.expense + "18",
                        }),
                ]}
              >
                <Text style={styles.catEmoji}>{c.emoji}</Text>
                <Text
                  style={[
                    styles.catLabel,
                    { color: colors.textSecondary },
                    selectedCategory?.label === c.label && {
                      color: isIncome ? colors.income : colors.expense,
                    },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Subcategories */}
          {selectedCategory?.subcategories &&
            selectedCategory.subcategories.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.subCatScroll}
              >
                {selectedCategory.subcategories.map((sub) => (
                  <TouchableOpacity
                    key={sub}
                    onPress={() =>
                      setSelectedSubcategory(
                        selectedSubcategory === sub ? null : sub,
                      )
                    }
                    style={[
                      styles.subCatBtn,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      selectedSubcategory === sub &&
                        (isIncome
                          ? {
                              borderColor: colors.income,
                              backgroundColor: colors.income + "18",
                            }
                          : {
                              borderColor: colors.expense,
                              backgroundColor: colors.expense + "18",
                            }),
                    ]}
                  >
                    <Text
                      style={[
                        styles.subCatLabel,
                        { color: colors.textSecondary },
                        selectedSubcategory === sub && {
                          color: isIncome ? colors.income : colors.expense,
                        },
                      ]}
                    >
                      {sub}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

          {/* Account Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.accountScroll}
          >
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                onPress={() => setSelectedAccount(acc)}
                style={[
                  styles.accountBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                  selectedAccount?.id === acc.id && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primaryGlow,
                  },
                ]}
              >
                <Text style={styles.accountEmoji}>{acc.emoji}</Text>
                <Text
                  style={[
                    styles.accountLabel,
                    { color: colors.textSecondary },
                    selectedAccount?.id === acc.id && { color: colors.primary },
                  ]}
                >
                  {acc.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Note */}
          <TextInput
            style={[
              styles.noteInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Add a note (optional)..."
            placeholderTextColor={colors.textMuted}
            value={note}
            onChangeText={setNote}
          />

          {/* Date Selector */}
          <TouchableOpacity
            style={[
              styles.dateBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.dateBtnText, { color: colors.text }]}>
              {formatDateShort(txDate)}
            </Text>
            <Text style={[styles.dateBtnSub, { color: colors.textSecondary }]}>
              {txDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={colors.textSecondary}
            />
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
                <Text style={[styles.padText, { color: colors.text }]}>
                  {k}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Save button */}
          {saved ? (
            <View
              style={[
                styles.successBtn,
                {
                  backgroundColor: colors.primaryGlow,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={[styles.successText, { color: colors.primary }]}>
                ✅ Saved!
              </Text>
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
                      ? gradients.income
                      : gradients.expense
                    : [colors.border, colors.border]
                }
                style={styles.saveBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text
                  style={[
                    styles.saveBtnText,
                    !canSave && { color: colors.textMuted },
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
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
    alignItems: "center",
  },
  toggleText: { fontSize: 14, fontWeight: "600" },
  amtWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 16,
  },
  currency: { fontSize: 28, marginRight: 4 },
  amtText: { fontSize: 48, fontWeight: "800" },
  catScroll: { marginBottom: 8 },
  catBtn: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 6,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  catEmoji: { fontSize: 22, marginBottom: 3 },
  catLabel: { fontSize: 10, fontWeight: "500" },
  subCatScroll: { marginBottom: 12 },
  subCatBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  subCatLabel: { fontSize: 11, fontWeight: "500" },
  accountScroll: { marginBottom: 12 },
  accountBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  accountEmoji: { fontSize: 18 },
  accountLabel: { fontSize: 11, fontWeight: "500" },
  noteInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 12,
    borderWidth: 1,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    gap: 8,
  },
  dateBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dateBtnSub: {
    flex: 1,
    fontSize: 12,
  },
  numpad: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14 },
  padBtn: { width: "33.33%", paddingVertical: 14, alignItems: "center" },
  padText: { fontSize: 22, fontWeight: "600" },
  saveBtn: { borderRadius: 18, paddingVertical: 17, alignItems: "center" },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  successBtn: {
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: "center",
    borderWidth: 1,
  },
  successText: { fontSize: 16, fontWeight: "700" },
});
