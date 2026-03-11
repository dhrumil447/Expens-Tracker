import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  StatusBar,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getColors, getGradients } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import { useGoals } from "../hooks/useGoals";

const EMOJIS = ["🎯", "🛡️", "💻", "🏖️", "📱", "🏠", "🚗", "✈️", "💍", "🎓"];

function GoalsScreen() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const gradients = getGradients(isDark);
  const { goals, addGoal, fundGoal, deleteGoal } = useGoals();
  const [showAdd, setShowAdd] = useState(false);
  const [showFund, setShowFund] = useState(null); // goal object
  const [fundAmount, setFundAmount] = useState("");
  const [form, setForm] = useState({
    name: "",
    target: "",
    deadline: "",
    emoji: "🎯",
  });

  const handleAddGoal = () => {
    if (!form.name || !form.target) {
      Alert.alert("Missing Info", "Please enter goal name and target amount.");
      return;
    }
    addGoal(form);
    setShowAdd(false);
    setForm({ name: "", target: "", deadline: "", emoji: "🎯" });
  };

  const handleFund = () => {
    if (!fundAmount || isNaN(parseFloat(fundAmount))) return;
    fundGoal(showFund.id, fundAmount);
    setShowFund(null);
    setFundAmount("");
  };

  const handleDeleteGoal = (goal) => {
    Alert.alert("Delete Goal", `Delete "${goal.name}"?`, [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteGoal(goal.id),
      },
    ]);
  };

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const completed = goals.filter((g) => g.saved >= g.target).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>Goals</Text>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={styles.addBtn}
          >
            <LinearGradient
              colors={gradients.primary}
              style={styles.addBtnInner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={[styles.addBtnText, { color: colors.white }]}>
                New Goal
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statNum, { color: colors.text }]}>
              {goals.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Goals
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statNum, { color: colors.income }]}>
              {completed}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Completed
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statNum, { color: colors.primary }]}>
              ₹{(totalSaved / 1000).toFixed(0)}K
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Saved
            </Text>
          </View>
        </View>

        {/* Goals List */}
        {goals.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🎯</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No goals yet
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Tap "New Goal" to start saving for something amazing!
            </Text>
          </View>
        ) : (
          goals.map((goal) => {
            const pct = Math.min((goal.saved / goal.target) * 100, 100);
            const isComplete = pct >= 100;
            const remaining = Math.max(goal.target - goal.saved, 0);
            return (
              <View
                key={goal.id}
                style={[
                  styles.goalCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.goalHeader}>
                  <View style={styles.goalLeft}>
                    <View
                      style={[
                        styles.goalEmoji,
                        { backgroundColor: colors.surface },
                      ]}
                    >
                      <Text style={{ fontSize: 26 }}>{goal.emoji}</Text>
                    </View>
                    <View>
                      <Text style={[styles.goalName, { color: colors.text }]}>
                        {goal.name}
                      </Text>
                      {goal.deadline ? (
                        <Text
                          style={[
                            styles.goalDeadline,
                            { color: colors.textSecondary },
                          ]}
                        >
                          by {goal.deadline}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  {isComplete ? (
                    <View style={styles.doneBadge}>
                      <Text
                        style={[
                          styles.doneBadgeText,
                          { color: colors.primary },
                        ]}
                      >
                        ✅ Done!
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => handleDeleteGoal(goal)}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.amtRow}>
                  <Text style={[styles.savedAmt, { color: colors.primary }]}>
                    ₹{goal.saved.toLocaleString("en-IN")}
                  </Text>
                  <Text
                    style={[styles.targetAmt, { color: colors.textSecondary }]}
                  >
                    / ₹{goal.target.toLocaleString("en-IN")}
                  </Text>
                </View>

                <View
                  style={[
                    styles.progressBg,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isComplete ? ["#10b981", "#059669"] : gradients.primary
                    }
                    style={[styles.progressFill, { width: `${pct}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>

                <View style={styles.goalFooter}>
                  <Text
                    style={[styles.pctText, { color: colors.textSecondary }]}
                  >
                    {isComplete
                      ? "🎉 Goal achieved!"
                      : `${pct.toFixed(0)}% · ₹${remaining.toLocaleString("en-IN")} remaining`}
                  </Text>
                  {!isComplete && (
                    <TouchableOpacity
                      onPress={() => setShowFund(goal)}
                      style={[
                        styles.fundBtn,
                        { backgroundColor: colors.primaryGlow },
                      ]}
                    >
                      <Text
                        style={[styles.fundBtnText, { color: colors.primary }]}
                      >
                        + Fund
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAdd}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAdd(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setShowAdd(false)}
          />
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View
              style={[styles.modalHandle, { backgroundColor: colors.border }]}
            />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              New Goal
            </Text>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              Choose Emoji
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              {EMOJIS.map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => setForm((f) => ({ ...f, emoji: e }))}
                  style={[
                    styles.emojiBtn,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.transparent,
                    },
                    form.emoji === e && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primaryGlow,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Goal name (e.g. Goa Trip)"
              placeholderTextColor={colors.textMuted}
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Target amount (₹)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={form.target}
              onChangeText={(v) => setForm((f) => ({ ...f, target: v }))}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Deadline (e.g. Dec 2026)"
              placeholderTextColor={colors.textMuted}
              value={form.deadline}
              onChangeText={(v) => setForm((f) => ({ ...f, deadline: v }))}
            />

            <TouchableOpacity onPress={handleAddGoal} activeOpacity={0.85}>
              <LinearGradient
                colors={gradients.primary}
                style={styles.createBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.createBtnText, { color: colors.white }]}>
                  Create Goal {form.emoji}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Fund Modal */}
      <Modal
        visible={!!showFund}
        animationType="fade"
        transparent
        onRequestClose={() => setShowFund(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setShowFund(null)}
          />
          <View style={[styles.fundModal, { backgroundColor: colors.card }]}>
            <Text style={[styles.fundTitle, { color: colors.text }]}>
              Fund "{showFund?.name}"
            </Text>
            <Text style={[styles.fundSub, { color: colors.textSecondary }]}>
              How much are you adding today?
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.fundInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Amount (₹)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={fundAmount}
              onChangeText={setFundAmount}
              autoFocus
            />
            <View style={styles.fundBtns}>
              <TouchableOpacity
                onPress={() => setShowFund(null)}
                style={[styles.cancelBtn, { backgroundColor: colors.surface }]}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFund}
                activeOpacity={0.85}
                style={styles.confirmBtnWrap}
              >
                <LinearGradient
                  colors={gradients.primary}
                  style={styles.confirmBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={{ color: colors.white, fontWeight: "700" }}>
                    Add ₹{Number(fundAmount || 0).toLocaleString("en-IN")}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "800" },
  addBtn: { borderRadius: 14, overflow: "hidden" },
  addBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 4,
  },
  addBtnText: { fontWeight: "700", fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  statNum: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: { fontSize: 11 },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  goalCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  goalLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  goalEmoji: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  goalName: { fontSize: 15, fontWeight: "700" },
  goalDeadline: { fontSize: 11, marginTop: 2 },
  doneBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  doneBadgeText: { fontSize: 12, fontWeight: "700" },
  amtRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 10,
  },
  savedAmt: { fontSize: 20, fontWeight: "800" },
  targetAmt: { fontSize: 13 },
  progressBg: {
    height: 8,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: { height: "100%", borderRadius: 6 },
  goalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pctText: { fontSize: 12 },
  fundBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  fundBtnText: { fontWeight: "700", fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  modalLabel: { fontSize: 13, marginBottom: 10 },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 2,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
  },
  createBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  createBtnText: { fontWeight: "700", fontSize: 16 },
  fundModal: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  fundTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
  },
  fundSub: { fontSize: 13, marginBottom: 16 },
  fundInput: { textAlign: "center", fontSize: 24, fontWeight: "700" },
  fundBtns: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    borderRadius: 14,
  },
  confirmBtnWrap: { flex: 2, borderRadius: 14, overflow: "hidden" },
  confirmBtn: { padding: 16, alignItems: "center" },
});

export default React.memo(GoalsScreen);

