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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Gradients } from "../theme/colors";
import { useGoals } from "../hooks/useGoals";

const EMOJIS = ["🎯", "🛡️", "💻", "🏖️", "📱", "🏠", "🚗", "✈️", "💍", "🎓"];

export default function GoalsScreen() {
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Goals</Text>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={styles.addBtn}
          >
            <LinearGradient
              colors={Gradients.primary}
              style={styles.addBtnInner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
              <Text style={styles.addBtnText}>New Goal</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{goals.length}</Text>
            <Text style={styles.statLabel}>Total Goals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.income }]}>
              {completed}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.primary }]}>
              ₹{(totalSaved / 1000).toFixed(0)}K
            </Text>
            <Text style={styles.statLabel}>Total Saved</Text>
          </View>
        </View>

        {/* Goals List */}
        {goals.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🎯</Text>
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptyDesc}>
              Tap "New Goal" to start saving for something amazing!
            </Text>
          </View>
        ) : (
          goals.map((goal) => {
            const pct = Math.min((goal.saved / goal.target) * 100, 100);
            const isComplete = pct >= 100;
            const remaining = Math.max(goal.target - goal.saved, 0);
            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalLeft}>
                    <View style={styles.goalEmoji}>
                      <Text style={{ fontSize: 26 }}>{goal.emoji}</Text>
                    </View>
                    <View>
                      <Text style={styles.goalName}>{goal.name}</Text>
                      {goal.deadline ? (
                        <Text style={styles.goalDeadline}>
                          by {goal.deadline}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  {isComplete ? (
                    <View style={styles.doneBadge}>
                      <Text style={styles.doneBadgeText}>✅ Done!</Text>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => handleDeleteGoal(goal)}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={Colors.textMuted}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.amtRow}>
                  <Text style={styles.savedAmt}>
                    ₹{goal.saved.toLocaleString("en-IN")}
                  </Text>
                  <Text style={styles.targetAmt}>
                    / ₹{goal.target.toLocaleString("en-IN")}
                  </Text>
                </View>

                <View style={styles.progressBg}>
                  <LinearGradient
                    colors={
                      isComplete ? ["#10b981", "#059669"] : Gradients.primary
                    }
                    style={[styles.progressFill, { width: `${pct}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>

                <View style={styles.goalFooter}>
                  <Text style={styles.pctText}>
                    {isComplete
                      ? "🎉 Goal achieved!"
                      : `${pct.toFixed(0)}% · ₹${remaining.toLocaleString("en-IN")} remaining`}
                  </Text>
                  {!isComplete && (
                    <TouchableOpacity
                      onPress={() => setShowFund(goal)}
                      style={styles.fundBtn}
                    >
                      <Text style={styles.fundBtnText}>+ Fund</Text>
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
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Goal</Text>

            <Text style={styles.modalLabel}>Choose Emoji</Text>
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
                    form.emoji === e && styles.emojiBtnActive,
                  ]}
                >
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder="Goal name (e.g. Goa Trip)"
              placeholderTextColor={Colors.textMuted}
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Target amount (₹)"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={form.target}
              onChangeText={(v) => setForm((f) => ({ ...f, target: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Deadline (e.g. Dec 2026)"
              placeholderTextColor={Colors.textMuted}
              value={form.deadline}
              onChangeText={(v) => setForm((f) => ({ ...f, deadline: v }))}
            />

            <TouchableOpacity onPress={handleAddGoal} activeOpacity={0.85}>
              <LinearGradient
                colors={Gradients.primary}
                style={styles.createBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.createBtnText}>
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
          <View style={styles.fundModal}>
            <Text style={styles.fundTitle}>Fund "{showFund?.name}"</Text>
            <Text style={styles.fundSub}>How much are you adding today?</Text>
            <TextInput
              style={[styles.input, styles.fundInput]}
              placeholder="Amount (₹)"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={fundAmount}
              onChangeText={setFundAmount}
              autoFocus
            />
            <View style={styles.fundBtns}>
              <TouchableOpacity
                onPress={() => setShowFund(null)}
                style={styles.cancelBtn}
              >
                <Text style={{ color: Colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFund}
                activeOpacity={0.85}
                style={styles.confirmBtnWrap}
              >
                <LinearGradient
                  colors={Gradients.primary}
                  style={styles.confirmBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={{ color: Colors.white, fontWeight: "700" }}>
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
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "800", color: Colors.text },
  addBtn: { borderRadius: 14, overflow: "hidden" },
  addBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 4,
  },
  addBtnText: { color: Colors.white, fontWeight: "700", fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  statNum: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: { fontSize: 11, color: Colors.textSecondary },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  goalCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  goalName: { fontSize: 15, fontWeight: "700", color: Colors.text },
  goalDeadline: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  doneBadge: {
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  doneBadgeText: { fontSize: 12, color: Colors.primary, fontWeight: "700" },
  amtRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 10,
  },
  savedAmt: { fontSize: 20, fontWeight: "800", color: Colors.primary },
  targetAmt: { fontSize: 13, color: Colors.textSecondary },
  progressBg: {
    height: 8,
    backgroundColor: Colors.border,
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
  pctText: { fontSize: 12, color: Colors.textSecondary },
  fundBtn: {
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  fundBtnText: { color: Colors.primary, fontWeight: "700", fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 16,
  },
  modalLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10 },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 2,
    borderColor: Colors.transparent,
  },
  emojiBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  createBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  createBtnText: { color: Colors.white, fontWeight: "700", fontSize: 16 },
  fundModal: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  fundTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 4,
  },
  fundSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
  fundInput: { textAlign: "center", fontSize: 24, fontWeight: "700" },
  fundBtns: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
  },
  confirmBtnWrap: { flex: 2, borderRadius: 14, overflow: "hidden" },
  confirmBtn: { padding: 16, alignItems: "center" },
});
