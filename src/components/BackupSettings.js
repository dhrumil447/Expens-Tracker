import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DocumentPicker from "react-native-document-picker";
import { getColors } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import {
  exportBackup,
  importBackup,
  downloadBackup,
  shareBackupViaEmail,
  setBackupSchedule,
  getBackupSchedule,
  getLastBackupTime,
} from "../utils/backupRestore";

export default function BackupSettings({ visible, onClose }) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [schedule, setSchedule] = useState("manual");
  const [lastBackup, setLastBackup] = useState(null);
  const [restoreData, setRestoreData] = useState("");

  useEffect(() => {
    if (visible) {
      loadBackupInfo();
    }
  }, [visible]);

  const loadBackupInfo = async () => {
    const currentSchedule = await getBackupSchedule();
    const lastBackupTime = await getLastBackupTime();
    setSchedule(currentSchedule);
    setLastBackup(lastBackupTime);
  };

  const handleScheduleChange = async (newSchedule) => {
    const success = await setBackupSchedule(newSchedule);
    if (success) {
      setSchedule(newSchedule);
      Alert.alert(
        "Schedule Updated",
        `Backup schedule set to ${newSchedule === "manual" ? "Manual" : newSchedule.charAt(0).toUpperCase() + newSchedule.slice(1)}`,
      );
    }
  };

  const handleManualBackup = async () => {
    try {
      const success = await downloadBackup();
      if (success) {
        loadBackupInfo();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create backup");
    }
  };

  const handleEmailBackup = async () => {
    try {
      const success = await shareBackupViaEmail();
      if (success) {
        loadBackupInfo();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to share backup via email");
    }
  };

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: "cachesDirectory",
      });

      if (result && result[0]) {
        const file = result[0];

        // Read file content
        const fileUri = Platform.OS === "ios" ? file.fileCopyUri : file.uri;

        // For React Native, we'll use fetch to read the file
        const response = await fetch(fileUri);
        const fileContent = await response.text();

        // Try to parse and validate it's valid JSON
        try {
          const backupData = JSON.parse(fileContent);

          if (!backupData.data || !backupData.version) {
            Alert.alert(
              "Invalid File",
              "This doesn't appear to be a valid backup file.",
            );
            return;
          }

          // Confirm and restore directly
          Alert.alert(
            "Restore Backup",
            `File: ${file.name}\nCreated: ${backupData.timestamp ? new Date(backupData.timestamp).toLocaleDateString() : "Unknown"}\n\nThis will replace all current data. Continue?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Restore",
                style: "destructive",
                onPress: async () => {
                  try {
                    const success = await importBackup(backupData);
                    if (success) {
                      Alert.alert(
                        "Success",
                        "Backup restored successfully. Please restart the app.",
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              setRestoreData("");
                              onClose();
                            },
                          },
                        ],
                      );
                    }
                  } catch (error) {
                    Alert.alert("Error", "Failed to restore backup");
                  }
                },
              },
            ],
          );
        } catch (parseError) {
          Alert.alert(
            "Invalid File",
            "Could not parse backup file. Make sure it's a valid JSON backup file.",
          );
        }
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled
        console.log("User cancelled file picker");
      } else {
        Alert.alert("Error", "Failed to select file");
        console.error("File picker error:", err);
      }
    }
  };

  const handleRestore = async () => {
    if (!restoreData.trim()) {
      Alert.alert("Error", "Please paste the backup data");
      return;
    }

    Alert.alert(
      "Restore Backup",
      "This will replace all current data with the backup. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: async () => {
            try {
              const backupData = JSON.parse(restoreData);
              const success = await importBackup(backupData);
              if (success) {
                Alert.alert(
                  "Success",
                  "Backup restored successfully. Please restart the app.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        setRestoreData("");
                        onClose();
                      },
                    },
                  ],
                );
              }
            } catch (error) {
              Alert.alert("Error", "Invalid backup data or restore failed");
            }
          },
        },
      ],
    );
  };

  const formatLastBackup = () => {
    if (!lastBackup) return "Never";
    const date = new Date(lastBackup);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              Backup & Restore
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Last Backup Info */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.primaryGlow || colors.primary + "20",
                },
              ]}
            >
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.primary}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  Last Backup
                </Text>
                <Text
                  style={[styles.infoDesc, { color: colors.textSecondary }]}
                >
                  {formatLastBackup()}
                </Text>
              </View>
            </View>

            {/* Backup Schedule */}
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.textSecondary, marginTop: 24 },
              ]}
            >
              AUTOMATIC BACKUP SCHEDULE
            </Text>

            <View style={styles.scheduleGrid}>
              {["manual", "daily", "monthly"].map((scheduleOption) => (
                <TouchableOpacity
                  key={scheduleOption}
                  style={[
                    styles.scheduleCard,
                    {
                      backgroundColor: colors.background,
                      borderColor:
                        schedule === scheduleOption
                          ? colors.primary
                          : colors.border,
                      borderWidth: schedule === scheduleOption ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleScheduleChange(scheduleOption)}
                >
                  <Ionicons
                    name={
                      scheduleOption === "manual"
                        ? "hand-left"
                        : scheduleOption === "daily"
                          ? "today"
                          : "calendar"
                    }
                    size={24}
                    color={
                      schedule === scheduleOption
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.scheduleLabel,
                      {
                        color:
                          schedule === scheduleOption
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                  >
                    {scheduleOption.charAt(0).toUpperCase() +
                      scheduleOption.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Manual Backup Section */}
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.textSecondary, marginTop: 24 },
              ]}
            >
              CREATE BACKUP
            </Text>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: colors.incomeGlow || colors.income + "20",
                  borderColor: colors.income,
                },
              ]}
              onPress={handleManualBackup}
            >
              <Ionicons name="download" size={22} color={colors.income} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  Download Backup File
                </Text>
                <Text
                  style={[styles.actionDesc, { color: colors.textSecondary }]}
                >
                  Save backup to your device
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: colors.primaryGlow || colors.primary + "20",
                  borderColor: colors.primary,
                },
              ]}
              onPress={handleEmailBackup}
            >
              <Ionicons name="mail" size={22} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  Share via Email/Apps
                </Text>
                <Text
                  style={[styles.actionDesc, { color: colors.textSecondary }]}
                >
                  Send backup through Gmail or other apps
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Restore Section */}
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.textSecondary, marginTop: 24 },
              ]}
            >
              RESTORE FROM BACKUP
            </Text>

            {/* File Selection Button */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: colors.expenseGlow || colors.expense + "20",
                  borderColor: colors.expense,
                },
              ]}
              onPress={handleSelectFile}
            >
              <Ionicons name="folder-open" size={22} color={colors.expense} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  Select Backup File
                </Text>
                <Text
                  style={[styles.actionDesc, { color: colors.textSecondary }]}
                >
                  Choose a .json backup file from your device
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Or Divider */}
            <View style={styles.orDivider}>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
              <Text style={[styles.orText, { color: colors.textSecondary }]}>
                OR
              </Text>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
            </View>

            {/* Manual Paste Option */}
            <View
              style={[
                styles.restoreCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.restoreLabel, { color: colors.text }]}>
                Paste Backup Data Below
              </Text>
              <TextInput
                style={[
                  styles.restoreInput,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Paste your backup JSON data here..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={6}
                value={restoreData}
                onChangeText={setRestoreData}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[
                  styles.restoreBtn,
                  {
                    backgroundColor: restoreData.trim()
                      ? colors.primary
                      : colors.border,
                  },
                ]}
                onPress={handleRestore}
                disabled={!restoreData.trim()}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={restoreData.trim() ? "#fff" : colors.textMuted}
                />
                <Text
                  style={[
                    styles.restoreBtnText,
                    {
                      color: restoreData.trim() ? "#fff" : colors.textMuted,
                    },
                  ]}
                >
                  Restore Backup
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
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
    maxHeight: "90%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
  },
  scheduleGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  scheduleCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  scheduleLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  actionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  restoreCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  restoreLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  restoreInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    minHeight: 120,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  restoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  restoreBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
