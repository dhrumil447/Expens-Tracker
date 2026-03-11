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
import { useCategories } from "../hooks/useCategories";

const EMOJIS = [
  "📌",
  "🍕",
  "🛒",
  "🚗",
  "⚡",
  "🎬",
  "💊",
  "📚",
  "✈️",
  "🍺",
  "🏠",
  "💇",
  "🐾",
  "💼",
  "💻",
  "📈",
  "💸",
  "🎁",
  "🏪",
  "🎓",
  "💰",
  "🎯",
  "⭐",
  "❤️",
  "🔥",
  "💎",
  "🎮",
  "🎵",
  "📱",
  "💡",
];

export default function CategoryManager({ visible, onClose }) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    removeSubcategory,
    resetToDefaults,
  } = useCategories();

  const [activeTab, setActiveTab] = useState("expense");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("📌");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }
    await addCategory({
      label: newCategoryName.trim(),
      emoji: newCategoryEmoji,
      type: activeTab,
      subcategories: [],
    });
    setNewCategoryName("");
    setNewCategoryEmoji("📌");
    setShowAddCategory(false);
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategoryName.trim()) {
      Alert.alert("Error", "Please enter a subcategory name");
      return;
    }
    await addSubcategory(showAddSubcategory.id, newSubcategoryName.trim());
    setNewSubcategoryName("");
    setShowAddSubcategory(null);
  };

  const handleDeleteCategory = (category) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCategory(category.id),
        },
      ],
    );
  };

  const handleDeleteSubcategory = (category, subcategory) => {
    Alert.alert(
      "Delete Subcategory",
      `Delete "${subcategory}" from ${category.label}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeSubcategory(category.id, subcategory),
        },
      ],
    );
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Categories",
      "This will reset all categories to defaults. Custom categories will be removed.",
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

  const renderCategory = ({ item: category }) => (
    <View
      style={[
        styles.categoryCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={() =>
          setSelectedCategory(
            selectedCategory?.id === category.id ? null : category,
          )
        }
      >
        <View style={styles.categoryLeft}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          <Text style={[styles.categoryLabel, { color: colors.text }]}>
            {category.label}
          </Text>
          {category.isCustom && (
            <View
              style={[
                styles.customBadge,
                { backgroundColor: colors.primaryGlow },
              ]}
            >
              <Text style={[styles.customBadgeText, { color: colors.primary }]}>
                Custom
              </Text>
            </View>
          )}
        </View>
        <View style={styles.categoryRight}>
          <Text style={[styles.subcountText, { color: colors.textSecondary }]}>
            {(category.subcategories || []).length} sub
          </Text>
          <Ionicons
            name={
              selectedCategory?.id === category.id
                ? "chevron-up"
                : "chevron-down"
            }
            size={18}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {selectedCategory?.id === category.id && (
        <View
          style={[styles.subcategorySection, { borderTopColor: colors.border }]}
        >
          {(category.subcategories || []).map((sub, index) => (
            <View
              key={index}
              style={[
                styles.subcategoryRow,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.subcategoryText,
                  { color: colors.textSecondary },
                ]}
              >
                • {sub}
              </Text>
              <TouchableOpacity
                onPress={() => handleDeleteSubcategory(category, sub)}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.expense}
                />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.addSubBtn, { borderColor: colors.primary }]}
            onPress={() => setShowAddSubcategory(category)}
          >
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={[styles.addSubText, { color: colors.primary }]}>
              Add Subcategory
            </Text>
          </TouchableOpacity>

          {category.isCustom && (
            <TouchableOpacity
              style={[styles.deleteBtn, { borderColor: colors.expense }]}
              onPress={() => handleDeleteCategory(category)}
            >
              <Ionicons name="trash-outline" size={16} color={colors.expense} />
              <Text style={[styles.deleteBtnText, { color: colors.expense }]}>
                Delete Category
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
              Manage Categories
            </Text>
            <TouchableOpacity onPress={handleReset}>
              <Ionicons name="refresh" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={[styles.tabRow, { backgroundColor: colors.surface }]}>
            {["expense", "income"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tab,
                  activeTab === tab && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === tab ? colors.white : colors.textSecondary,
                    },
                  ]}
                >
                  {tab === "expense" ? "Expense" : "Income"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Categories List */}
          <FlatList
            data={filteredCategories}
            keyExtractor={(item) => item.id}
            renderItem={renderCategory}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* Add Category Button */}
          <TouchableOpacity
            style={[styles.addCategoryBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddCategory(true)}
          >
            <Ionicons name="add" size={22} color={colors.white} />
            <Text style={styles.addCategoryText}>Add New Category</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Category Modal */}
      <Modal
        visible={showAddCategory}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAddCategory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add New Category
            </Text>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              Choose Emoji
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.emojiScroll}
            >
              {EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setNewCategoryEmoji(emoji)}
                  style={[
                    styles.emojiBtn,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    newCategoryEmoji === emoji && {
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
              Category Name
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
              placeholder="e.g., Pet Care"
              placeholderTextColor={colors.textMuted}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[
                  styles.modalCancelBtn,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => {
                  setShowAddCategory(false);
                  setNewCategoryName("");
                  setNewCategoryEmoji("📌");
                }}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleAddCategory}
              >
                <Text style={{ color: colors.white, fontWeight: "700" }}>
                  Add Category
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Subcategory Modal */}
      <Modal
        visible={!!showAddSubcategory}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAddSubcategory(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add Subcategory to {showAddSubcategory?.emoji}{" "}
              {showAddSubcategory?.label}
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
              placeholder="e.g., Fast Food"
              placeholderTextColor={colors.textMuted}
              value={newSubcategoryName}
              onChangeText={setNewSubcategoryName}
              autoFocus
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[
                  styles.modalCancelBtn,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => {
                  setShowAddSubcategory(null);
                  setNewSubcategoryName("");
                }}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleAddSubcategory}
              >
                <Text style={{ color: colors.white, fontWeight: "700" }}>
                  Add
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
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  categoryCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 15,
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
  categoryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subcountText: {
    fontSize: 12,
  },
  subcategorySection: {
    padding: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  subcategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  subcategoryText: {
    fontSize: 14,
  },
  addSubBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 6,
  },
  addSubText: {
    fontSize: 13,
    fontWeight: "600",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  addCategoryBtn: {
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
  addCategoryText: {
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
