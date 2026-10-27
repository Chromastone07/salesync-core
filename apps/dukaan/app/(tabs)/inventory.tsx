import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
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
import { translations, UNIVERSAL_UNITS, SUGGESTED_ITEMS } from "@/constants/translations";
import * as DocumentPicker from "expo-document-picker";
import { downloadCSVTemplate, parseInventoryCSV } from "@/utils/csvUtils";
import { ScannerModal } from "@/components/ScannerModal";
import { UnknownBarcodeModal } from "@/components/UnknownBarcodeModal";
import { StateView, EmptyState } from "@/components/StateView";
import { fetchProductNameByBarcode, matchBarcode } from "@/utils/fmcgApi";

const UNITS = [...UNIVERSAL_UNITS];

type FormState = {
  label: string;
  localLabel: string;
  unit: string;
  rate: string;
  isService: boolean;
  stock: string;
  barcode: string;
};

const emptyForm = (): FormState => ({
  label: "",
  localLabel: "",
  unit: "piece",
  rate: "",
  isService: false,
  stock: "",
  barcode: "",
});

export default function InventoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language, businessType } = useApp();
  const {
    inventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addInventoryItems,
    isLoading,
    loadError,
    reloadStoreData,
  } = useStore();
  const t = translations[language] || translations.en;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanTarget, setScanTarget] = useState<"header" | "form">("header");
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [existingScannedItem, setExistingScannedItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return inventoryItems;
    const q = searchQuery.toLowerCase().trim();
    return inventoryItems.filter(
      (item) =>
        (item.localLabel && item.localLabel.toLowerCase().includes(q)) ||
        (item.label && item.label.toLowerCase().includes(q)) ||
        (item.barcode && item.barcode.includes(q))
    );
  }, [inventoryItems, searchQuery]);

  const unnamedItems = useMemo(
    () => inventoryItems.filter((i) => i.needsNaming),
    [inventoryItems]
  );

  const swipePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return gestureState.dy > 8;
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 50 || gestureState.vy > 0.4) {
            Haptics.selectionAsync();
            setModalVisible(false);
          }
        },
      }),
    []
  );

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

  const handleLoadStarterItems = async () => {
    const suggested = SUGGESTED_ITEMS[businessType] ?? SUGGESTED_ITEMS.other;
    const existingNames = new Set(
      inventoryItems.map((i) => (i.localLabel || i.label).trim().toLowerCase())
    );

    const toAdd = suggested
      .filter((s) => {
        const name = (language === "hi" ? s.hi : language === "mr" ? s.mr : s.en).trim().toLowerCase();
        return !existingNames.has(name) && !existingNames.has(s.en.trim().toLowerCase());
      })
      .map((s) => {
        const name = language === "hi" ? s.hi : language === "mr" ? s.mr : s.en;
        return {
          label: s.en,
          localLabel: name,
          unit: s.unit,
          rate: s.rate,
          isService: s.isService,
          needsNaming: false,
        };
      });

    if (toAdd.length === 0) {
      Alert.alert(
        language === "hi" ? "पहले से मौजूद" : language === "mr" ? "आधीच उपलब्ध" : "Already Present",
        language === "hi"
          ? "इस दुकान के शुरुआती सामान आपकी सूची में पहले से हैं।"
          : language === "mr"
            ? "या व्यवसायासाठी सुरुवाती वस्तू तुमच्या स्टॉकमध्ये आधीच आहेत."
            : "Starter items for this shop are already present in your inventory."
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addInventoryItems(toAdd);
    Alert.alert(
      language === "hi" ? "सफलता" : language === "mr" ? "यशस्वी" : "Success",
      `${toAdd.length} ${t.starterItemsSuccess}`
    );
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
      barcode: item.barcode || "",
    });
    setModalVisible(true);
  };

  const handleScanBarcode = async (barcode: string) => {
    setShowScanner(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (scanTarget === "form") {
      setForm((f) => ({ ...f, barcode }));
      if (!form.label.trim()) {
        try {
          const fetched = await fetchProductNameByBarcode(barcode);
          if (fetched) {
            setForm((f) => ({
              ...f,
              label: f.label || fetched,
              localLabel: f.localLabel || fetched,
            }));
          }
        } catch {
          // ignore
        }
      }
      return;
    }

    // Direct scan from inventory header: open streamlined modal!
    const existing = inventoryItems.find((i) => matchBarcode(i.barcode, barcode));
    setExistingScannedItem(existing || null);
    setScannedBarcode(barcode);
  };

  const handleSaveScannedInventory = async (data: {
    label: string;
    localLabel: string;
    unit: string;
    rate: number;
    stock?: number;
    barcode: string;
  }) => {
    await addInventoryItem({
      ...data,
      isService: false,
      needsNaming: false,
    });
    setScannedBarcode(null);
    setExistingScannedItem(null);
  };

  const handleUpdateScannedStock = async (itemId: string, addStock: number, newRate?: number) => {
    const item = inventoryItems.find((i) => i.id === itemId);
    if (!item) return;
    const currentStock = typeof item.stock === "number" ? item.stock : 0;
    const updatedStock = currentStock + addStock;
    await updateInventoryItem(itemId, {
      ...item,
      stock: updatedStock,
      rate: typeof newRate === "number" && newRate > 0 ? newRate : item.rate,
    });
    setScannedBarcode(null);
    setExistingScannedItem(null);
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
        barcode: form.barcode.trim() || undefined,
        needsNaming: false,
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
    unnamedBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#FEF3C7",
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 4,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#FDE68A",
    },
    unnamedBannerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    unnamedBannerIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "#FDE68A",
      alignItems: "center",
      justifyContent: "center",
    },
    unnamedBannerTitle: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: "#92400E",
    },
    unnamedBannerSub: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: "#B45309",
      marginTop: 1,
    },
    needsNamingTag: {
      fontSize: 10,
      fontFamily: "Inter_600SemiBold",
      color: "#B45309",
      backgroundColor: "#FEF3C7",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    barcodeTag: {
      fontSize: 10,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      backgroundColor: colors.muted,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    barcodeInputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
    },
    barcodeScanBtn: {
      width: 46,
      height: 46,
      borderRadius: colors.radius - 2,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
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
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginHorizontal: 16,
      marginTop: 10,
      marginBottom: 6,
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      height: 40,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    searchClear: {
      padding: 2,
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
    swipeArea: {
      paddingTop: 4,
      paddingBottom: 2,
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
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable style={styles.actionBtn} onPress={downloadCSVTemplate}>
            <Feather name="download" size={17} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={handleImportCSV}>
            <Feather name="upload" size={17} color="#FFFFFF" />
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => {
              setScanTarget("header");
              setShowScanner(true);
            }}
          >
            <Feather name="camera" size={17} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={openAdd}>
            <Feather name="plus" size={17} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* Unnamed items reminder banner */}
      {unnamedItems.length > 0 && (
        <Pressable
          style={styles.unnamedBanner}
          onPress={() => openEdit(unnamedItems[0])}
        >
          <View style={styles.unnamedBannerLeft}>
            <View style={styles.unnamedBannerIcon}>
              <Feather name="tag" size={15} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.unnamedBannerTitle}>
                {unnamedItems.length} {unnamedItems.length === 1 ? "item needs" : "items need"} a name
              </Text>
              <Text style={styles.unnamedBannerSub}>
                Quick-added via barcode · Tap to name & set stock
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color="#D97706" />
        </Pressable>
      )}

      {/* Search Bar */}
      {inventoryItems.length > 0 && (
        <View style={styles.searchBar}>
          <Feather name="search" size={15} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items by name or barcode..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable style={styles.searchClear} onPress={() => setSearchQuery("")}>
              <Feather name="x" size={15} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      )}

      <StateView
        isLoading={isLoading}
        loadingMessage="Loading inventory..."
        error={loadError}
        errorMessage="Could not read inventory catalog from local storage."
        onRetry={reloadStoreData}
        isEmpty={inventoryItems.length === 0}
        emptyIcon="package"
        emptyTitle={t.noItems}
        emptySubtitle={t.addFirstItem}
        emptyActionLabel={"✨ " + t.loadStarterItems}
        onEmptyAction={handleLoadStarterItems}
        emptySecondaryActionLabel="+ Add First Item"
        onEmptySecondaryAction={openAdd}
      >
        {filteredItems.length === 0 ? (
          <EmptyState
            icon="search"
            title="No items found"
            subtitle={`No item in your catalog matches "${searchQuery}"`}
            actionLabel="Clear Search"
            onAction={() => setSearchQuery("")}
            secondaryActionLabel="+ Add This Item"
            onSecondaryAction={() => {
              openAdd();
              setForm((f) => ({ ...f, localLabel: searchQuery }));
            }}
          />
        ) : (
          <FlatList
            data={filteredItems}
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
                    {item.needsNaming ? (
                      <Text style={styles.needsNamingTag}>⚠️ Name Pending</Text>
                    ) : item.barcode ? (
                      <Text style={styles.barcodeTag}>🏷️ {item.barcode}</Text>
                    ) : null}
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
      </StateView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
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
                <View {...swipePanResponder.panHandlers} style={styles.swipeArea}>
                  <View style={styles.modalHandle} />
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {editingId ? t.editItem : t.addItem}
                    </Text>
                    <Pressable onPress={() => setModalVisible(false)} hitSlop={12}>
                      <Feather name="x" size={22} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
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

                <Text style={styles.fieldLabel}>Barcode (Optional)</Text>
                <View style={styles.barcodeInputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    value={form.barcode}
                    onChangeText={(v) => setForm((f) => ({ ...f, barcode: v }))}
                    placeholder="Scan or enter barcode"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                  />
                  <Pressable
                    style={styles.barcodeScanBtn}
                    onPress={() => {
                      setScanTarget("form");
                      setShowScanner(true);
                    }}
                  >
                    <Feather name="camera" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>

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

      <ScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanBarcode}
      />

      <UnknownBarcodeModal
        visible={!!scannedBarcode}
        barcode={scannedBarcode || ""}
        mode="inventory"
        existingItem={existingScannedItem}
        onClose={() => {
          setScannedBarcode(null);
          setExistingScannedItem(null);
        }}
        onSaveInventory={handleSaveScannedInventory}
        onUpdateInventoryStock={handleUpdateScannedStock}
      />
    </View>
  );
}
