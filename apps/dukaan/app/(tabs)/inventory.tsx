import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useStore } from "@/context/StoreContext";
import type { InventoryItem } from "@/context/StoreContext";
import { useColors } from "@/hooks/useColors";
import { translations } from "@/constants/translations";
import * as DocumentPicker from "expo-document-picker";
import { downloadCSVTemplate, parseInventoryCSV } from "@/utils/csvUtils";

const UNITS = ["kg", "liter", "piece", "dozen", "gram", "meter", "pack", "bottle"];

type FormState = {
  label: string;
  localLabel: string;
  unit: string;
  rate: string;
  isService: boolean;
  stock: string;
};

const emptyForm = (): FormState => ({
  label: "",
  localLabel: "",
  unit: "piece",
  rate: "",
  isService: false,
  stock: "",
});

export default function InventoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { inventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem, addInventoryItems } = useStore();
  const t = translations[language];

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);

  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/csv", "*/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      
      const fileUri = result.assets[0].uri;
      const parsedItems = await parseInventoryCSV(fileUri);
      
      if (parsedItems.length > 0) {
        await addInventoryItems(parsedItems);
        Alert.alert("Success", `Imported ${parsedItems.length} items successfully!`);
      } else {
        Alert.alert("Error", "No valid items found in CSV.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to parse CSV file. Make sure it follows the template.");
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalVisible(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setForm({
      label: item.label,
      localLabel: item.localLabel,
      unit: item.unit,
      rate: item.rate.toString(),
      isService: item.isService,
      stock: item.stock !== undefined ? item.stock.toString() : "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.label.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);
    try {
      const data = {
        label: form.label.trim(),
        localLabel: form.localLabel.trim() || form.label.trim(),
        unit: form.unit,
        rate: parseFloat(form.rate) || 0,
        isService: form.isService,
        stock: form.isService ? undefined : (form.stock ? parseFloat(form.stock) : undefined),
      };
      if (editingId) {
        await updateInventoryItem(editingId, data);
      } else {
        await addInventoryItem(data);
      }
      setModalVisible(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (item: InventoryItem) => {
    Alert.alert(t.deleteConfirm, item.localLabel || item.label, [
      { text: t.no, style: "cancel" },
      {
        text: t.yes,
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteInventoryItem(item.id);
        },
      },
    ]);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
      paddingHorizontal: 20,
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    actionBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    list: { flex: 1 },
    itemCard: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    itemIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    itemInfo: { flex: 1 },
    itemLabel: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    itemMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 3,
    },
    itemUnit: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    serviceTag: {
      fontSize: 10,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
      backgroundColor: "#FFF7ED",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      overflow: "hidden",
    },
    stockTag: {
      fontSize: 10,
      fontFamily: "Inter_500Medium",
      color: "#059669",
      backgroundColor: "#D1FAE5",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      overflow: "hidden",
    },
    stockTagLow: {
      color: "#DC2626",
      backgroundColor: "#FEE2E2",
    },
    itemRate: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginRight: 14,
    },
    deleteBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#FEE2E2",
      alignItems: "center",
      justifyContent: "center",
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 20,
    },
    templateBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: colors.radius,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    templateBtnText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontFamily: "Inter_500Medium",
    },
    listBottom: { height: 160 },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingHorizontal: 20,
      paddingBottom: insets.bottom + 24,
    },
    modalHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 20,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    fieldLabel: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    input: {
      backgroundColor: colors.muted,
      borderRadius: colors.radius - 2,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    unitRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    unitChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    unitChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    unitText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    unitTextSelected: { color: "#FFFFFF" },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.muted,
      borderRadius: colors.radius - 2,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    switchLabel: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
    },
    saveBtnText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.inventory}</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable style={styles.actionBtn} onPress={downloadCSVTemplate}>
            <Feather name="download" size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={handleImportCSV}>
            <Feather name="upload" size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={openAdd}>
            <Feather name="plus" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {inventoryItems.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="package" size={32} color={colors.mutedForeground} />
          </View>
          <Text style={styles.emptyTitle}>{t.noItems}</Text>
          <Text style={styles.emptyText}>{t.addFirstItem}</Text>
          <Pressable style={styles.templateBtn} onPress={downloadCSVTemplate}>
            <Feather name="download" size={16} color="#FFFFFF" />
            <Text style={styles.templateBtnText}>Download CSV Template</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={inventoryItems}
          keyExtractor={(i) => i.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable style={styles.itemCard} onPress={() => openEdit(item)}>
              <View style={styles.itemIcon}>
                <Feather
                  name={item.isService ? "zap" : "box"}
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemLabel}>
                  {item.localLabel || item.label}
                </Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemUnit}>{item.unit}</Text>
                  {item.isService && (
                    <Text style={styles.serviceTag}>Service</Text>
                  )}
                  {!item.isService && item.stock !== undefined && (
                    <Text style={[styles.stockTag, item.stock <= 5 && styles.stockTagLow]}>
                      Stock: {item.stock}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={styles.itemRate}>₹{item.rate}</Text>
              <Pressable
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}
                hitSlop={8}
              >
                <Feather name="trash-2" size={14} color={colors.destructive} />
              </Pressable>
            </Pressable>
          )}
          ListFooterComponent={<View style={styles.listBottom} />}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <Pressable onPress={() => {}}>
              <ScrollView
                style={styles.modalSheet}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingId ? t.editItem : t.addItem}
                  </Text>
                  <Pressable onPress={() => setModalVisible(false)}>
                    <Feather name="x" size={22} color={colors.mutedForeground} />
                  </Pressable>
                </View>

                <Text style={styles.fieldLabel}>{t.itemName} (English)</Text>
                <TextInput
                  style={styles.input}
                  value={form.label}
                  onChangeText={(v) => setForm((f) => ({ ...f, label: v }))}
                  placeholder="e.g. Sugar"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="words"
                />

                <Text style={styles.fieldLabel}>
                  {language === "hi"
                    ? "हिन्दी नाम"
                    : language === "mr"
                      ? "मराठी नाव"
                      : "Local Name (optional)"}
                </Text>
                <TextInput
                  style={styles.input}
                  value={form.localLabel}
                  onChangeText={(v) => setForm((f) => ({ ...f, localLabel: v }))}
                  placeholder={
                    language === "hi"
                      ? "जैसे: चीनी"
                      : language === "mr"
                        ? "उदा: साखर"
                        : "Local name"
                  }
                  placeholderTextColor={colors.mutedForeground}
                />

                <Text style={styles.fieldLabel}>{t.price}</Text>
                <TextInput
                  style={styles.input}
                  value={form.rate}
                  onChangeText={(v) => setForm((f) => ({ ...f, rate: v }))}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                />

                {!form.isService && (
                  <>
                    <Text style={styles.fieldLabel}>Stock Quantity (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={form.stock}
                      onChangeText={(v) => setForm((f) => ({ ...f, stock: v }))}
                      placeholder="e.g. 50"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="numeric"
                    />
                  </>
                )}

                <Text style={styles.fieldLabel}>{t.unit}</Text>
                <View style={styles.unitRow}>
                  {UNITS.map((u) => (
                    <Pressable
                      key={u}
                      style={[
                        styles.unitChip,
                        form.unit === u && styles.unitChipSelected,
                      ]}
                      onPress={() => setForm((f) => ({ ...f, unit: u }))}
                    >
                      <Text
                        style={[
                          styles.unitText,
                          form.unit === u && styles.unitTextSelected,
                        ]}
                      >
                        {u}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>{t.service}</Text>
                  <Switch
                    value={form.isService}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, isService: v }))
                    }
                    trackColor={{
                      false: colors.border,
                      true: colors.primary,
                    }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <Pressable
                  style={styles.saveBtn}
                  onPress={handleSave}
                  disabled={isSaving || !form.label.trim()}
                >
                  <Text style={styles.saveBtnText}>{t.save}</Text>
                </Pressable>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}
