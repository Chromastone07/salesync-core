import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  PanResponder,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { fetchProductDetailsByBarcode } from "@/utils/fmcgApi";
import type { InventoryItem } from "@/context/StoreContext";
import { UNIVERSAL_UNITS } from "@/constants/translations";

const QUICK_PRICES = [5, 10, 20, 30, 50, 100];
const QUICK_STOCK_ADD = [5, 10, 20, 50, 100];
const UNITS = [...UNIVERSAL_UNITS];

type Props = {
  visible: boolean;
  barcode: string;
  mode?: "sale" | "inventory";
  existingItem?: InventoryItem | null;
  onClose: () => void;
  // Sale mode
  onQuickAdd?: (price: number, name?: string, stock?: number) => void;
  // Inventory mode
  onSaveInventory?: (data: {
    label: string;
    localLabel: string;
    unit: string;
    rate: number;
    stock?: number;
    barcode: string;
  }) => void;
  onUpdateInventoryStock?: (itemId: string, addStock: number, newRate?: number) => void;
  // Backwards compatibility
  onQuickSale?: (price: number) => void;
  onAddCatalog?: (name: string, price: number, stock?: number) => void;
};

export function UnknownBarcodeModal({
  visible,
  barcode,
  mode = "sale",
  existingItem,
  onClose,
  onQuickAdd,
  onSaveInventory,
  onUpdateInventoryStock,
  onQuickSale,
  onAddCatalog,
}: Props) {
  const colors = useColors();

  const isRestockMode = mode === "inventory" && !!existingItem;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("piece");
  const [addStockQty, setAddStockQty] = useState("");
  const [isFetchingOnline, setIsFetchingOnline] = useState(false);
  const [foundOnline, setFoundOnline] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const swipePanResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return gestureState.dy > 8;
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 45 || gestureState.vy > 0.4) {
            Haptics.selectionAsync();
            onClose();
          }
        },
      }),
    [onClose]
  );

  useEffect(() => {
    if (visible && barcode) {
      if (isRestockMode && existingItem) {
        setName(existingItem.label);
        setPrice(existingItem.rate.toString());
        setUnit(existingItem.unit || "piece");
        setAddStockQty("");
        setIsFetchingOnline(false);
        setFoundOnline(false);
        return;
      }

      setName("");
      setPrice("");
      setStock("");
      setUnit("piece");
      setAddStockQty("");
      setFoundOnline(false);
      setShowMore(mode === "inventory"); // Show stock & unit by default in inventory mode
      setIsFetchingOnline(true);

      // Fast v2 Open Food Facts & Open Beauty Facts lookup
      fetchProductDetailsByBarcode(barcode)
        .then((product) => {
          if (product && product.name) {
            setName(product.name);
            setFoundOnline(true);

            // Infer unit from quantity string if available (e.g. 500g, 1L, etc.)
            const q = (product.quantity || "").toLowerCase();
            if (q.includes("kg") || q.includes(" g") || q.includes("gm")) {
              setUnit("pack");
            } else if (q.includes(" l") || q.includes("ml") || q.includes("liter")) {
              setUnit("bottle");
            } else if (q.includes("pack") || q.includes("pouch")) {
              setUnit("pack");
            }
          }
        })
        .finally(() => {
          setIsFetchingOnline(false);
        });
    }
  }, [visible, barcode, isRestockMode, existingItem, mode]);

  if (!visible) return null;

  const parsedPrice = parseFloat(price);
  const isPriceValid = !isNaN(parsedPrice) && parsedPrice > 0;

  const handleSelectPriceChip = (amt: number) => {
    Haptics.selectionAsync();
    setPrice(amt.toString());
  };

  const handleSelectStockChip = (qty: number) => {
    Haptics.selectionAsync();
    if (isRestockMode) {
      const current = parseFloat(addStockQty) || 0;
      setAddStockQty((current + qty).toString());
    } else {
      setStock(qty.toString());
    }
  };

  const handleSubmit = () => {
    if (!isPriceValid) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 1. Existing Item Restock
    if (isRestockMode && existingItem && onUpdateInventoryStock) {
      const additionalStock = parseFloat(addStockQty) || 0;
      onUpdateInventoryStock(existingItem.id, additionalStock, parsedPrice);
      onClose();
      return;
    }

    // 2. Inventory Mode (Add New Item to Catalog)
    if (mode === "inventory" && onSaveInventory) {
      const parsedStock = parseFloat(stock);
      const validStock = !isNaN(parsedStock) && parsedStock >= 0 ? parsedStock : undefined;
      const finalName = name.trim() || `Item (${barcode.slice(-4)})`;

      onSaveInventory({
        label: finalName,
        localLabel: finalName,
        unit: unit,
        rate: parsedPrice,
        stock: validStock,
        barcode: barcode,
      });
      onClose();
      return;
    }

    // 3. Sale Mode (Quick Add to Bill)
    const parsedStock = parseFloat(stock);
    const validStock = !isNaN(parsedStock) && parsedStock >= 0 ? parsedStock : undefined;

    if (onQuickAdd) {
      onQuickAdd(parsedPrice, name.trim() || undefined, validStock);
    } else if (onAddCatalog) {
      onAddCatalog(name.trim() || `Item (${barcode.slice(-4)})`, parsedPrice, validStock);
    } else if (onQuickSale) {
      onQuickSale(parsedPrice);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%", maxWidth: 420 }}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={[s.card, { backgroundColor: colors.background }]}>
            {/* Swipe handle and header */}
            <View {...swipePanResponder.panHandlers} style={s.swipeHeaderArea}>
              <View style={s.dragHandle} />
              <View style={s.header}>
                <View style={s.headerLeft}>
                  <View style={[s.headerIcon, { backgroundColor: colors.secondary }]}>
                    <Feather
                      name={isRestockMode ? "refresh-cw" : mode === "inventory" ? "box" : "zap"}
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.title, { color: colors.foreground }]} numberOfLines={1}>
                      {isRestockMode
                        ? "Restock & Update Item"
                        : mode === "inventory"
                        ? "Add to Inventory"
                        : "Quick Add to Bill"}
                    </Text>
                    <Text style={[s.barcodeText, { color: colors.mutedForeground }]}>
                      🏷️ Barcode: {barcode}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={onClose} style={s.closeBtn} hitSlop={10}>
                  <Feather name="x" size={20} color={colors.foreground} />
                </Pressable>
              </View>
            </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Existing Item Summary (Restock Mode) */}
            {isRestockMode && existingItem && (
              <View style={[s.existingItemBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Text style={[s.existingItemName, { color: colors.foreground }]}>
                  {existingItem.localLabel || existingItem.label}
                </Text>
                <View style={s.existingItemMeta}>
                  <Text style={[s.existingItemMetaText, { color: colors.mutedForeground }]}>
                    Current Stock:{" "}
                    <Text style={{ fontFamily: "Inter_700Bold", color: colors.foreground }}>
                      {existingItem.stock !== undefined ? existingItem.stock : "Unlimited"} {existingItem.unit}
                    </Text>
                  </Text>
                  <Text style={[s.existingItemMetaText, { color: colors.mutedForeground }]}>
                    Current Rate:{" "}
                    <Text style={{ fontFamily: "Inter_700Bold", color: colors.primary }}>
                      ₹{existingItem.rate}
                    </Text>
                  </Text>
                </View>
              </View>
            )}

            {/* Online status indicator */}
            {!isRestockMode && (
              <>
                {isFetchingOnline && (
                  <View style={[s.statusPill, { backgroundColor: colors.muted }]}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[s.statusText, { color: colors.mutedForeground }]}>
                      Searching product database...
                    </Text>
                  </View>
                )}

                {foundOnline && (
                  <View style={[s.statusPill, { backgroundColor: "#ECFDF5" }]}>
                    <Feather name="check-circle" size={14} color="#059669" />
                    <Text style={[s.statusText, { color: "#059669" }]} numberOfLines={1}>
                      Found: {name}
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Restock Quantity (Restock Mode) */}
            {isRestockMode && (
              <View style={s.section}>
                <Text style={[s.sectionLabel, { color: colors.foreground }]}>
                  Add Stock Units (+)
                </Text>
                <View style={[s.priceInputWrapper, { borderColor: colors.primary }]}>
                  <Text style={[s.currencySymbol, { color: colors.primary, fontSize: 18 }]}>+</Text>
                  <TextInput
                    style={[s.priceInput, { color: colors.foreground }]}
                    placeholder="0"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    value={addStockQty}
                    onChangeText={setAddStockQty}
                    autoFocus
                  />
                  <Text style={[s.unitSuffix, { color: colors.mutedForeground }]}>{unit}</Text>
                </View>

                {/* Quick Add Stock Chips */}
                <View style={s.chipsRow}>
                  {QUICK_STOCK_ADD.map((qty) => (
                    <Pressable
                      key={qty}
                      style={[s.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}
                      onPress={() => handleSelectStockChip(qty)}
                    >
                      <Text style={[s.chipText, { color: colors.foreground }]}>+{qty}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Product Name Input */}
            {!isRestockMode && (
              <View style={s.inputGroup}>
                <View style={s.labelRow}>
                  <Text style={[s.label, { color: colors.foreground }]}>
                    Product Name {mode === "inventory" ? "*" : "(Optional — or speak 🎙️)"}
                  </Text>
                </View>
                <TextInput
                  style={[s.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.muted }]}
                  placeholder='e.g. "Parle G 100g" or "Dettol Soap"'
                  placeholderTextColor={colors.mutedForeground}
                  value={name}
                  onChangeText={setName}
                  autoFocus={!foundOnline}
                />
              </View>
            )}

            {/* Selling Price Input */}
            <View style={s.priceSection}>
              <Text style={[s.sectionLabel, { color: colors.foreground }]}>
                Selling Price (₹) *
              </Text>
              <View style={[s.priceInputWrapper, { borderColor: isPriceValid ? colors.primary : colors.border }]}>
                <Text style={[s.currencySymbol, { color: colors.primary }]}>₹</Text>
                <TextInput
                  style={[s.priceInput, { color: colors.foreground }]}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  autoFocus={foundOnline && !isRestockMode}
                />
              </View>

              {/* Quick MRP Chips */}
              <View style={s.chipsRow}>
                {QUICK_PRICES.map((amt) => {
                  const isSelected = price === amt.toString();
                  return (
                    <Pressable
                      key={amt}
                      style={[
                        s.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.muted,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => handleSelectPriceChip(amt)}
                    >
                      <Text
                        style={[
                          s.chipText,
                          {
                            color: isSelected ? "#FFFFFF" : colors.foreground,
                            fontFamily: isSelected ? "Inter_700Bold" : "Inter_500Medium",
                          },
                        ]}
                      >
                        ₹{amt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Initial Stock (Inventory New Item Mode) */}
            {!isRestockMode && (
              <>
                <View style={s.inputGroup}>
                  <Text style={[s.label, { color: colors.foreground }]}>Initial Stock Quantity (Optional)</Text>
                  <TextInput
                    style={[s.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.muted }]}
                    placeholder="e.g. 50"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    value={stock}
                    onChangeText={setStock}
                  />
                  {/* Quick Initial Stock Chips */}
                  <View style={[s.chipsRow, { marginTop: 6 }]}>
                    {QUICK_STOCK_ADD.map((qty) => (
                      <Pressable
                        key={qty}
                        style={[
                          s.chip,
                          {
                            backgroundColor: stock === qty.toString() ? colors.primary : colors.muted,
                            borderColor: stock === qty.toString() ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => handleSelectStockChip(qty)}
                      >
                        <Text
                          style={[
                            s.chipText,
                            {
                              color: stock === qty.toString() ? "#FFF" : colors.foreground,
                            },
                          ]}
                        >
                          {qty}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Unit Selector */}
                <View style={s.inputGroup}>
                  <Text style={[s.label, { color: colors.foreground }]}>Unit</Text>
                  <View style={s.chipsRow}>
                    {UNITS.map((u) => {
                      const isSelected = unit === u;
                      return (
                        <Pressable
                          key={u}
                          style={[
                            s.chip,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.muted,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setUnit(u);
                          }}
                        >
                          <Text
                            style={[
                              s.chipText,
                              {
                                color: isSelected ? "#FFFFFF" : colors.foreground,
                                fontFamily: isSelected ? "Inter_700Bold" : "Inter_500Medium",
                              },
                            ]}
                          >
                            {u}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

            {/* Action Button */}
            <Pressable
              style={[
                s.submitBtn,
                { backgroundColor: colors.primary },
                !isPriceValid && s.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isPriceValid}
            >
              <Feather
                name={isRestockMode ? "check" : mode === "inventory" ? "box" : "plus-circle"}
                size={18}
                color="#FFFFFF"
              />
              <Text style={s.submitBtnText}>
                {isRestockMode
                  ? "Update Stock & Price"
                  : mode === "inventory"
                  ? isPriceValid
                    ? `Save to Inventory · ₹${price}`
                    : "Enter Price to Save"
                  : isPriceValid
                  ? `Add to Bill · ₹${price}`
                  : "Enter Price to Add"}
              </Text>
            </Pressable>

            <Text style={[s.autoLearnHint, { color: colors.mutedForeground }]}>
              {mode === "inventory"
                ? "💡 Product will be saved with this barcode for rapid 1-scan checkout."
                : "💡 SaleSync will remember this barcode and price for instant 1-scan checkout next time!"}
            </Text>
          </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxHeight: "90%",
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  swipeHeaderArea: {
    paddingBottom: 2,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  barcodeText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  existingItemBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  existingItemName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  existingItemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  existingItemMetaText: {
    fontSize: 12,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 14,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  section: {
    marginBottom: 14,
  },
  priceSection: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  priceInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  currencySymbol: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginRight: 6,
  },
  unitSuffix: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginLeft: 6,
  },
  priceInput: {
    flex: 1,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    paddingVertical: 0,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  autoLearnHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 6,
    lineHeight: 15,
  },
});
