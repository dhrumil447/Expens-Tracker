import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Share, Platform, PermissionsAndroid } from "react-native";
import RNFS from "react-native-fs";

const BACKUP_SCHEDULE_KEY = "dhanpath_backup_schedule";
const LAST_BACKUP_KEY = "dhanpath_last_backup";

// Storage keys for all app data
const STORAGE_KEYS = {
  expenses: "dhanpath_rn_expenses",
  categories: "dhanpath_categories",
  accounts: "dhanpath_accounts",
  goals: "dhanpath_rn_goals",
  onboarded: "dhanpath_rn_onboarded",
};

/**
 * Export all app data as JSON
 */
export async function exportBackup() {
  try {
    const backupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      data: {},
    };

    // Collect all data from AsyncStorage
    for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
      const value = await AsyncStorage.getItem(storageKey);
      if (value) {
        backupData.data[key] = value;
      }
    }

    // Update last backup timestamp
    await AsyncStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());

    return backupData;
  } catch (error) {
    console.error("Export backup error:", error);
    throw new Error("Failed to create backup");
  }
}

/**
 * Import and restore data from backup JSON
 */
export async function importBackup(backupData) {
  try {
    if (!backupData || !backupData.data) {
      throw new Error("Invalid backup file");
    }

    // Restore all data to AsyncStorage
    for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
      if (backupData.data[key]) {
        await AsyncStorage.setItem(storageKey, backupData.data[key]);
      }
    }

    return true;
  } catch (error) {
    console.error("Import backup error:", error);
    throw new Error("Failed to restore backup");
  }
}

/**
 * Download backup as JSON file (via Share)
 */
export async function downloadBackup() {
  try {
    const backupData = await exportBackup();
    const jsonString = JSON.stringify(backupData, null, 2);
    const fileName = `DhanPath_Backup_${new Date().toISOString().split("T")[0]}.json`;

    // Try to save to device storage
    try {
      // Request permissions on Android
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "DhanPath needs access to save backup file",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          },
        );
      }

      // Define file path
      const downloadPath =
        Platform.OS === "ios"
          ? RNFS.DocumentDirectoryPath
          : RNFS.DownloadDirectoryPath;

      const filePath = `${downloadPath}/${fileName}`;

      // Write file
      await RNFS.writeFile(filePath, jsonString, "utf8");

      // Share the file
      await Share.share({
        title: "DhanPath Backup",
        message: `Backup saved to: ${filePath}`,
        url: Platform.OS === "ios" ? `file://${filePath}` : filePath,
      });

      Alert.alert(
        "Backup Created",
        `Backup file saved to:\n${Platform.OS === "android" ? "Downloads/" : "Documents/"}${fileName}`,
      );

      return true;
    } catch (fileError) {
      console.error("File save error:", fileError);

      // Fallback to Share only
      await Share.share({
        title: "DhanPath Backup",
        message: `DhanPath App Backup\nDate: ${new Date().toLocaleDateString()}\n\nBackup Data:\n${jsonString}`,
      });

      Alert.alert(
        "Backup Created",
        "Backup has been shared. You can save it to your preferred location.",
      );

      return true;
    }
  } catch (error) {
    console.error("Download backup error:", error);
    Alert.alert("Error", "Failed to create backup file");
    return false;
  }
}

/**
 * Share backup via email/apps
 */
export async function shareBackupViaEmail() {
  try {
    const backupData = await exportBackup();
    const jsonString = JSON.stringify(backupData, null, 2);
    const fileName = `DhanPath_Backup_${new Date().toISOString().split("T")[0]}.json`;

    // Save to temp directory first
    const tempPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
    await RNFS.writeFile(tempPath, jsonString, "utf8");

    // Share the file
    await Share.share({
      title: "DhanPath Backup - Email",
      message: `DhanPath App Backup\nCreated: ${new Date().toLocaleString()}\n\nPlease save this backup file for data restore.`,
      url: Platform.OS === "ios" ? `file://${tempPath}` : `file://${tempPath}`,
    });

    return true;
  } catch (error) {
    console.error("Email backup error:", error);
    Alert.alert("Error", "Failed to share backup via email");
    return false;
  }
}

/**
 * Set backup schedule (daily, weekly, monthly, manual)
 */
export async function setBackupSchedule(schedule) {
  try {
    await AsyncStorage.setItem(BACKUP_SCHEDULE_KEY, schedule);
    return true;
  } catch (error) {
    console.error("Set backup schedule error:", error);
    return false;
  }
}

/**
 * Get current backup schedule
 */
export async function getBackupSchedule() {
  try {
    const schedule = await AsyncStorage.getItem(BACKUP_SCHEDULE_KEY);
    return schedule || "manual";
  } catch (error) {
    return "manual";
  }
}

/**
 * Get last backup timestamp
 */
export async function getLastBackupTime() {
  try {
    const timestamp = await AsyncStorage.getItem(LAST_BACKUP_KEY);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if automatic backup is due
 */
export async function checkAutomaticBackup() {
  try {
    const schedule = await getBackupSchedule();
    const lastBackup = await getLastBackupTime();

    if (schedule === "manual" || !lastBackup) {
      return false;
    }

    const now = new Date();
    const timeDiff = now - lastBackup;
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (schedule === "daily" && daysDiff >= 1) {
      return true;
    } else if (schedule === "weekly" && daysDiff >= 7) {
      return true;
    } else if (schedule === "monthly" && daysDiff >= 30) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Perform automatic backup if due
 */
export async function performAutomaticBackup() {
  try {
    const isDue = await checkAutomaticBackup();
    if (isDue) {
      await exportBackup();
      console.log("Automatic backup completed");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Automatic backup error:", error);
    return false;
  }
}

/**
 * Clear all app data
 */
export async function clearAllData() {
  try {
    for (const storageKey of Object.values(STORAGE_KEYS)) {
      await AsyncStorage.removeItem(storageKey);
    }
    await AsyncStorage.removeItem(BACKUP_SCHEDULE_KEY);
    await AsyncStorage.removeItem(LAST_BACKUP_KEY);
    return true;
  } catch (error) {
    console.error("Clear data error:", error);
    return false;
  }
}
