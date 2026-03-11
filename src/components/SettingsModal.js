import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getColors } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import CategoryManager from "./CategoryManager";
import AccountManager from "./AccountManager";

export default function SettingsModal({ visible, onClose }) {
  const { isDark, toggleTheme } = useTheme();
  const colors = getColors(isDark);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showAccountManager, setShowAccountManager] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

          {/* Theme Toggle */}
          <View
            style={[styles.settingRow, { borderBottomColor: colors.border }]}
          >
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.primaryGlow },
                ]}
              >
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Dark Mode
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}
                >
                  {isDark ? "Dark theme enabled" : "Light theme enabled"}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary + "50" }}
              thumbColor={isDark ? colors.primary : colors.textMuted}
            />
          </View>

          {/* Categories Section */}
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textSecondary, marginTop: 8 },
            ]}
          >
            CUSTOMIZATION
          </Text>

          <TouchableOpacity
            style={[
              styles.settingRow,
              { borderBottomColor: colors.border, borderBottomWidth: 0 },
            ]}
            onPress={() => setShowCategoryManager(true)}
          >
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.incomeGlow },
                ]}
              >
                <Ionicons name="grid" size={20} color={colors.income} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Manage Categories
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}
                >
                  Add custom categories & subcategories
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingRow,
              { borderBottomColor: colors.border, borderBottomWidth: 0 },
            ]}
            onPress={() => setShowAccountManager(true)}
          >
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor:
                      colors.expenseGlow || colors.expense + "20",
                  },
                ]}
              >
                <Ionicons name="wallet" size={20} color={colors.expense} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Manage Accounts
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}
                >
                  Cash, bank, card & more
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>

          {/* Category Manager Modal */}
          <CategoryManager
            visible={showCategoryManager}
            onClose={() => setShowCategoryManager(false)}
          />

          {/* Account Manager Modal */}
          <AccountManager
            visible={showAccountManager}
            onClose={() => setShowAccountManager(false)}
          />
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
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
    gap: 12,
  },
  themePreviewLight: {
    width: 60,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    overflow: "hidden",
  },
  lightPreviewHeader: {
    height: 10,
    backgroundColor: "#e2e8f0",
  },
  lightPreviewContent: {
    flex: 1,
    padding: 4,
  },
  lightPreviewCard: {
    flex: 1,
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  themePreviewDark: {
    width: 60,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#0a0f1a",
    borderWidth: 1,
    overflow: "hidden",
  },
  darkPreviewHeader: {
    height: 10,
    backgroundColor: "#1a2235",
  },
  darkPreviewContent: {
    flex: 1,
    padding: 4,
  },
  darkPreviewCard: {
    flex: 1,
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  themeOptionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  closeBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
