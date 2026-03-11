import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getColors } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import { useAccounts } from "../hooks/useAccounts";

const ACCOUNT_EMOJIS = [
  "💵",
  "🏦",
  "💳",
  "🐷",
  "👛",
  "💰",
  "🏧",
  "📱",
  "💎",
  "🪙",
  "🤑",
  "💸",
  "🏪",
  "🎯",
  "⭐",
  "🔐",
];

const ACCOUNT_TYPES = [
  { id: "cash", label: "Cash" },
  { id: "bank", label: "Bank" },
  { id: "card", label: "Card" },
  { id: "savings", label: "Savings" },
  { id: "wallet", label: "Wallet" },
  { id: "other", label: "Other" },
];

export default function AccountManager({ visible, onClose }) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    setDefaultAccount,
    resetToDefaults,
  } = useAccounts();

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountEmoji, setNewAccountEmoji] = useState("💵");
  const [newAccountType, setNewAccountType] = useState("cash");
  const [newAccountBalance, setNewAccountBalance] = useState("");

  const resetForm = () => {
    setNewAccountName("");
    setNewAccountEmoji("💵");
    setNewAccountType("cash");
    setNewAccountBalance("");
    setEditingAccount(null);
  };

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      Alert.alert("Error", "Please enter an account name");
      return;
    }

    if (editingAccount) {
      await updateAccount(editingAccount.id, {
        label: newAccountName.trim(),
        emoji: newAccountEmoji,
        type: newAccountType,
        balance: parseFloat(newAccountBalance) || 0,
      });
    } else {
      await addAccount({
        label: newAccountName.trim(),
        emoji: newAccountEmoji,
        type: newAccountType,
        balance: parseFloat(newAccountBalance) || 0,
      });
    }

    resetForm();
    setShowAddAccount(false);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setNewAccountName(account.label);
    setNewAccountEmoji(account.emoji);
    setNewAccountType(account.type);
    setNewAccountBalance(account.balance?.toString() || "0");
    setShowAddAccount(true);
  };

  const handleDeleteAccount = (account) => {
    if (account.isDefault) {
      Alert.alert(
        "Cannot Delete",
        "Cannot delete the default account. Set another account as default first.",
      );
      return;
    }

    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete "${account.label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAccount(account.id),
        },
      ],
    );
  };

  const handleSetDefault = (account) => {
    setDefaultAccount(account.id);
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Accounts",
      "This will reset all accounts to defaults. Custom accounts will be removed and balances will be reset to 0.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: resetToDefaults,
        },
      ],
    );
  };

  const formatBalance = (balance) => {
    const num = balance || 0;
    return num >= 0
      ? `₹${num.toLocaleString("en-IN")}`
      : `-₹${Math.abs(num).toLocaleString("en-IN")}`;
  };

  const renderAccount = ({ item: account }) => (
    <View
      style={[
        styles.accountCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity
        style={styles.accountHeader}
        onPress={() => handleEditAccount(account)}
      >
        <View style={styles.accountLeft}>
          <Text style={styles.accountEmoji}>{account.emoji}</Text>
          <View>
            <View style={styles.accountNameRow}>
              <Text style={[styles.accountLabel, { color: colors.text }]}>
                {account.label}
              </Text>
              {account.isDefault && (
                <View
                  style={[
                    styles.defaultBadge,
                    { backgroundColor: colors.primaryGlow },
                  ]}
                >
                  <Text
                    style={[styles.defaultBadgeText, { color: colors.primary }]}
                  >
                    Default
                  </Text>
                </View>
              )}
              {account.isCustom && (
                <View
                  style={[
                    styles.customBadge,
                    { backgroundColor: colors.incomeGlow },
                  ]}
                >
                  <Text
                    style={[styles.customBadgeText, { color: colors.income }]}
                  >
                    Custom
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.accountType, { color: colors.textSecondary }]}>
              {ACCOUNT_TYPES.find((t) => t.id === account.type)?.label ||
                account.type}
            </Text>
          </View>
        </View>
        <View style={styles.accountRight}>
          <Text
            style={[
              styles.balanceText,
              { color: account.balance >= 0 ? colors.income : colors.expense },
            ]}
          >
            {formatBalance(account.balance)}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      <View style={[styles.accountActions, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleSetDefault(account)}
          disabled={account.isDefault}
        >
          <Ionicons
            name={
              account.isDefault
                ? "checkmark-circle"
                : "checkmark-circle-outline"
            }
            size={18}
            color={account.isDefault ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.actionText,
              {
                color: account.isDefault
                  ? colors.primary
                  : colors.textSecondary,
              },
            ]}
          >
            {account.isDefault ? "Default" : "Set Default"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleEditAccount(account)}
        >
          <Ionicons name="pencil" size={16} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>
            Edit
          </Text>
        </TouchableOpacity>

        {!account.isDefault && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDeleteAccount(account)}
          >
            <Ionicons name="trash-outline" size={16} color={colors.expense} />
            <Text style={[styles.actionText, { color: colors.expense }]}>
              Delete
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              Manage Accounts
            </Text>
            <TouchableOpacity onPress={handleReset}>
              <Ionicons name="refresh" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Total Balance */}
          <View style={[styles.totalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
              Total Balance
            </Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>
              {formatBalance(
                accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0),
              )}
            </Text>
          </View>

          {/* Accounts List */}
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id}
            renderItem={renderAccount}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* Add Account Button */}
          <TouchableOpacity
            style={[styles.addAccountBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              resetForm();
              setShowAddAccount(true);
            }}
          >
            <Ionicons name="add" size={22} color={colors.white} />
            <Text style={styles.addAccountText}>Add New Account</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add/Edit Account Modal */}
      <Modal
        visible={showAddAccount}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setShowAddAccount(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingAccount ? "Edit Account" : "Add New Account"}
            </Text>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              Choose Icon
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.emojiScroll}
            >
              {ACCOUNT_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setNewAccountEmoji(emoji)}
                  style={[
                    styles.emojiBtn,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    newAccountEmoji === emoji && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primaryGlow,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              Account Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="e.g., HDFC Bank"
              placeholderTextColor={colors.textMuted}
              value={newAccountName}
              onChangeText={setNewAccountName}
            />

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              Account Type
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.typeScroll}
            >
              {ACCOUNT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setNewAccountType(type.id)}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    newAccountType === type.id && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primaryGlow,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      { color: colors.textSecondary },
                      newAccountType === type.id && { color: colors.primary },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              Initial Balance (₹)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              value={newAccountBalance}
              onChangeText={setNewAccountBalance}
              keyboardType="numeric"
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[
                  styles.modalCancelBtn,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => {
                  setShowAddAccount(false);
                  resetForm();
                }}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleAddAccount}
              >
                <Text style={{ color: colors.white, fontWeight: "700" }}>
                  {editingAccount ? "Save Changes" : "Add Account"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  totalCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "800",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  accountCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  accountEmoji: {
    fontSize: 28,
  },
  accountNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  accountLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  accountType: {
    fontSize: 12,
    marginTop: 2,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  customBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  accountRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: "700",
  },
  accountActions: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    gap: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  addAccountBtn: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  addAccountText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 13,
    marginBottom: 10,
  },
  emojiScroll: {
    marginBottom: 20,
  },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 2,
  },
  typeScroll: {
    marginBottom: 20,
  },
  typeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 20,
  },
  modalBtns: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },
  modalSaveBtn: {
    flex: 2,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },
});
