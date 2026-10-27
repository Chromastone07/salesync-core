import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useStore } from "@/context/StoreContext";
import type { SaleLineItem, Sale } from "@/context/StoreContext";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { translations } from "@/constants/translations";
import { ScannerModal } from "@/components/ScannerModal";
import { UnknownBarcodeModal } from "@/components/UnknownBarcodeModal";
import { ScannedItemModal } from "@/components/ScannedItemModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { StateView, EmptyState } from "@/components/StateView";
import { matchBarcode } from "@/utils/fmcgApi";

type CartItem = {
  itemId: string;
  label: string;
  localLabel: string;
  unit: string;
  rate: number;
  quantity: number;
  isService: boolean;
};

function formatCurrency(n: number) {
  return n % 1 === 0 ? `₹${n.toFixed(0)}` : `₹${n.toFixed(2)}`;
}

export default function SaleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language, activeStoreId, shopName } = useApp();
  const router = useRouter();
  const {
    inventoryItems,
    addSale,
    addInventoryItem,
    isLoading,
    loadError,
    reloadStoreData,
  } = useStore();
  const t = translations[language] || translations.en;

  React.useEffect(() => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setQuickAmount("");
    setQuickLabel("");
  }, [activeStoreId]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCustomer, setShowCustomer] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid">("paid");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [mode, setMode] = useState<"items" | "quick">("items");
  const [quickAmount, setQuickAmount] = useState("");
  const [quickLabel, setQuickLabel] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [unknownBarcode, setUnknownBarcode] = useState("");
  const [scannedItemId, setScannedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [editingQtyItem, setEditingQtyItem] = useState<CartItem | null>(null);
  const [qtyInput, setQtyInput] = useState<string>("");

  const filteredItems = inventoryItems.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      (item.localLabel && item.localLabel.toLowerCase().includes(q))
    );
  });

  const cartTotal = cart.reduce((s, i) => s + i.rate * i.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const getCartItem = (itemId: string) => cart.find((c) => c.itemId === itemId);

  const increment = (item: (typeof inventoryItems)[0]) => {
    const existing = cart.find((c) => c.itemId === item.id);
    const currentQty = existing ? existing.quantity : 0;
    
    if (!item.isService && item.stock !== undefined && currentQty >= item.stock) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Stock Limit Reached", `You only have ${item.stock} unit(s) of this item in stock.`);
      return;
    }

    Haptics.selectionAsync();
    if (existing) {
      setCart((prev) =>
        prev.map((c) =>
          c.itemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          itemId: item.id,
          label: item.label,
          localLabel: item.localLabel,
          unit: item.unit,
          rate: item.rate,
          quantity: 1,
          isService: item.isService,
        },
      ]);
    }
  };

  const decrement = (itemId: string) => {
    Haptics.selectionAsync();
    const existing = cart.find((c) => c.itemId === itemId);
    if (!existing) return;
    if (existing.quantity === 1) {
      setCart((prev) => prev.filter((c) => c.itemId !== itemId));
    } else {
      setCart((prev) =>
        prev.map((c) =>
          c.itemId === itemId ? { ...c, quantity: c.quantity - 1 } : c
        )
      );
    }
  };

  const handleClearAll = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setShowCustomer(false);
    setPaymentStatus("paid");
  };

  const handleScan = async (rawBarcode: string) => {
    const barcode = rawBarcode.trim();
    const item = inventoryItems.find((i) => matchBarcode(i.barcode, barcode));
    if (item) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowScanner(false);

      if (mode === "quick") {
        // Instant Sell Mode: Auto-fill everything and create sale directly!
        const lineItem: SaleLineItem = {
          item_id: item.id,
          label: item.localLabel || item.label,
          quantity: 1,
          unit: item.unit || "piece",
          rate: item.rate,
          total: item.rate,
          is_service: item.isService,
        };
        await processSale([lineItem]);
        return;
      }

      // Items Mode: Directly add to cart with zero annoying dialogs
      increment(item);
      return;
    }

    const quickSaleCartItem = cart.find((c) => c.itemId === `scanned-${barcode}`);
    if (quickSaleCartItem) {
      setCart((prev) =>
        prev.map((c) =>
          c.itemId === `scanned-${barcode}` ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowScanner(false);
      return;
    }

    setShowScanner(false);
    setUnknownBarcode(barcode);
  };

  const handleQuickAdd = async (price: number, name?: string, stock?: number) => {
    const isNamed = Boolean(name && name.trim());
    const label = isNamed ? name!.trim() : `Item (${unknownBarcode.slice(-4)})`;
    const newItem = await addInventoryItem({
      label: label,
      localLabel: label,
      unit: "piece",
      rate: price,
      isService: false,
      barcode: unknownBarcode,
      stock: stock,
      needsNaming: !isNamed,
    });

    if (mode === "quick") {
      const lineItem: SaleLineItem = {
        item_id: newItem.id,
        label: newItem.localLabel || newItem.label,
        quantity: 1,
        unit: newItem.unit || "piece",
        rate: newItem.rate,
        total: newItem.rate,
        is_service: newItem.isService,
      };
      await processSale([lineItem]);
    } else {
      increment(newItem);
    }
    setUnknownBarcode("");
  };

  const processSale = async (lineItems: SaleLineItem[]) => {
    const sale = await addSale(lineItems, {
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      status: paymentStatus,
    });
    setCart([]);
    setQuickAmount("");
    setQuickLabel("");
    setCustomerName("");
    setCustomerPhone("");
    setShowCustomer(false);
    setPaymentStatus("paid");
    setReceiptSale(sale);
  };

  const handleConfirmSale = () => {
    if (cart.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const lineItems: SaleLineItem[] = cart.map((c) => ({
      item_id: c.itemId,
      label: c.localLabel || c.label,
      quantity: c.quantity,
      unit: c.unit,
      rate: c.rate,
      total: c.rate * c.quantity,
      is_service: c.isService,
    }));
    
    if (paymentStatus === "unpaid" && !customerName.trim()) {
      Alert.alert(
        "Missing Customer Details",
        "You are about to create a 'Pay Later' (Khata) bill without a customer name. Are you sure you want to proceed?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Proceed", style: "default", onPress: () => processSale(lineItems) }
        ]
      );
    } else {
      processSale(lineItems);
    }
  };

  const handleQuickSale = () => {
    const amt = parseFloat(quickAmount);
    if (isNaN(amt) || amt <= 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const lineItem: SaleLineItem = {
      item_id: "quick-sale",
      label: quickLabel.trim() || (t.quickSale ?? "Quick Sale"),
      quantity: 1,
      unit: "total",
      rate: amt,
      total: amt,
      is_service: true,
    };
    
    if (paymentStatus === "unpaid" && !customerName.trim()) {
      Alert.alert(
        "Missing Customer Details",
        "You are about to create a 'Pay Later' (Khata) bill without a customer name. Are you sure you want to proceed?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Proceed", style: "default", onPress: () => processSale([lineItem]) }
        ]
      );
    } else {
      processSale([lineItem]);
    }
  };

  const tabBarHeight = Platform.OS === "web" ? 84 : 60;

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
      paddingHorizontal: 20,
      paddingBottom: 14,
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
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    scanBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.muted,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    scanBtnText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    clearBtn: { flexDirection: "row", gap: 4, alignItems: "center" },
    clearText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.destructive,
    },
    scroll: { flex: 1 },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 20,
      marginTop: 20,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      height: 44,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    searchClear: {
      padding: 4,
    },
    sectionLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 14,
      gap: 10,
    },
    tile: {
      width: "30%",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      minHeight: 100,
    },
    tileActive: {
      borderColor: colors.primary,
      backgroundColor: "#FFF7ED",
    },
    tileIcon: { marginBottom: 4 },
    tileLabel: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 2,
    },
    tileRate: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginBottom: 6,
    },
    qtyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 2,
    },
    qtyBtn: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    qtyBtnMinus: {
      backgroundColor: colors.muted,
    },
    qtyNum: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
      minWidth: 18,
      textAlign: "center",
    },
    addBtn: {
      marginTop: 4,
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: colors.primary,
    },
    addBtnText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: "#fff",
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
      marginTop: 60,
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
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      textAlign: "center",
    },
    emptySub: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 6,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: insets.bottom + tabBarHeight + 12,
      backgroundColor: colors.background,
      gap: 10,
    },
    customerToggleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 4,
    },
    customerToggleText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
    customerFields: {
      gap: 8,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      gap: 8,
      height: 40,
    },
    input: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    cartSummary: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cartLabel: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    cartTotal: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    cartItems: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 1,
    },
    confirmBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    confirmBtnDisabled: {
      backgroundColor: colors.muted,
    },
    confirmBtnText: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    confirmBtnTextDisabled: {
      color: colors.mutedForeground,
    },
    spacer: { height: 16 },
    modeToggle: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginTop: 14,
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      padding: 4,
    },
    toggleBtn: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: colors.radius - 4,
    },
    toggleBtnActive: {
      backgroundColor: colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    toggleText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
    },
    toggleTextActive: {
      color: colors.foreground,
    },
    quickSaleContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
      marginTop: 20,
    },
    paymentToggle: {
      flexDirection: "row",
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      padding: 4,
      marginTop: 4,
    },
    payBtn: {
      flex: 1,
      flexDirection: "row",
      gap: 6,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: colors.radius - 4,
    },
    payBtnActive: {
      backgroundColor: "#dcfce7",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    payBtnUnpaidActive: {
      backgroundColor: "#ffedd5",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    payText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
    },
    quickAmountInput: {
      fontSize: 48,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "center",
      minWidth: 150,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
      paddingVertical: 10,
    },
    quickAmountLabel: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginTop: 16,
    },
    quickLabelInput: {
      marginTop: 32,
      width: "80%",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 8,
      fontSize: 16,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      textAlign: "center",
    },
  });

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View>
            <Text style={s.headerTitle}>{t.newSale}</Text>
            {shopName ? (
              <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
                {shopName}
              </Text>
            ) : null}
          </View>
          <Pressable style={s.scanBtn} onPress={() => setShowScanner(true)}>
            <Feather name="maximize" size={18} color={colors.primary} />
            <Text style={s.scanBtnText}>{t.scanBarcode ?? "Scan"}</Text>
          </Pressable>
        </View>
        {cart.length > 0 && mode === "items" && (
          <Pressable style={s.clearBtn} onPress={handleClearAll}>
            <Feather name="x" size={14} color={colors.destructive} />
            <Text style={s.clearText}>{t.clearCart}</Text>
          </Pressable>
        )}
      </View>

      <View style={s.modeToggle}>
        <Pressable 
          style={[s.toggleBtn, mode === "items" && s.toggleBtnActive]}
          onPress={() => { setMode("items"); Haptics.selectionAsync(); }}
        >
          <Text style={[s.toggleText, mode === "items" && s.toggleTextActive]}>{t.inventory ?? "Items"}</Text>
        </Pressable>
        <Pressable 
          style={[s.toggleBtn, mode === "quick" && s.toggleBtnActive]}
          onPress={() => { setMode("quick"); Haptics.selectionAsync(); }}
        >
          <Text style={[s.toggleText, mode === "quick" && s.toggleTextActive]}>{t.quickSale ?? "Quick Sale"}</Text>
        </Pressable>
      </View>

      {/* Item grid */}
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {mode === "quick" ? (
          <View style={s.quickSaleContainer}>
            <TextInput
              style={s.quickAmountInput}
              value={quickAmount}
              onChangeText={setQuickAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
            />
            <Text style={s.quickAmountLabel}>{t.enterAmount ?? "Enter Amount"}</Text>
            
            <TextInput
              style={s.quickLabelInput}
              value={quickLabel}
              onChangeText={setQuickLabel}
              placeholder="What did you sell? (Optional)"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="sentences"
            />
          </View>
        ) : (
          <StateView
            isLoading={isLoading}
            loadingMessage="Loading items..."
            error={loadError}
            errorMessage="Could not read items for this store."
            onRetry={reloadStoreData}
            isEmpty={inventoryItems.length === 0}
            emptyIcon="package"
            emptyTitle={t.noItems}
            emptySubtitle={t.addFirstItem}
            emptyActionLabel="Manage Inventory"
            onEmptyAction={() => router.push("/(tabs)/inventory")}
          >
            <View style={s.searchContainer}>
              <Feather name="search" size={16} color={colors.mutedForeground} style={s.searchIcon} />
              <TextInput
                style={s.searchInput}
                placeholder="Search items..."
                placeholderTextColor={colors.mutedForeground}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")} style={s.searchClear}>
                  <Feather name="x-circle" size={16} color={colors.mutedForeground} />
                </Pressable>
              )}
            </View>

            {filteredItems.length === 0 ? (
              <EmptyState
                icon="search"
                title="No items found"
                subtitle={`No item matching "${searchQuery}" in your store catalog`}
                actionLabel="Clear Search"
                onAction={() => setSearchQuery("")}
                secondaryActionLabel="+ Add to Inventory"
                onSecondaryAction={() => router.push("/(tabs)/inventory")}
              />
            ) : (
              <>
                <Text style={s.sectionLabel}>{t.selectItems}</Text>
                <View style={s.grid}>
                  {filteredItems.map((item) => {
                    const cartItem = getCartItem(item.id);
                    const isActive = !!cartItem;
                    return (
                      <View
                        key={item.id}
                        style={[s.tile, isActive && s.tileActive]}
                      >
                        <Feather
                          style={s.tileIcon}
                          name={item.isService ? "zap" : "box"}
                          size={20}
                          color={isActive ? colors.primary : colors.mutedForeground}
                        />
                        <Text style={s.tileLabel} numberOfLines={2}>
                          {item.localLabel || item.label}
                        </Text>
                        <Text style={s.tileRate}>
                          ₹{item.rate}/{item.unit}
                        </Text>
                        {isActive ? (
                          <View style={s.qtyRow}>
                            <Pressable
                              style={[s.qtyBtn, s.qtyBtnMinus]}
                              onPress={() => decrement(item.id)}
                            >
                              <Feather name="minus" size={12} color={colors.foreground} />
                            </Pressable>
                            <Pressable
                              style={{
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: 6,
                                backgroundColor: colors.card,
                              }}
                              onPress={() => {
                                Haptics.selectionAsync();
                                setEditingQtyItem(cartItem!);
                                setQtyInput(cartItem!.quantity.toString());
                              }}
                            >
                              <Text style={s.qtyNum}>{cartItem!.quantity}</Text>
                            </Pressable>
                            <Pressable
                              style={s.qtyBtn}
                              onPress={() => increment(item)}
                            >
                              <Feather name="plus" size={12} color="#fff" />
                            </Pressable>
                          </View>
                        ) : (
                          <Pressable style={s.addBtn} onPress={() => increment(item)}>
                            <Text style={s.addBtnText}>+ Add</Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </StateView>
        )}
        <View style={s.spacer} />
      </ScrollView>

      {/* Bottom footer */}
      <View style={s.footer}>
        {/* Cart summary */}
        {mode === "items" && (
          <View style={s.cartSummary}>
            <View>
              <Text style={s.cartLabel}>{t.total ?? "Total"}</Text>
              <Text style={s.cartTotal}>{formatCurrency(cartTotal)}</Text>
              {cart.length > 0 && (
                <Text style={s.cartItems}>
                  {cart.map((c) => `${c.localLabel || c.label} ×${c.quantity}`).join(", ")}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Customer section — only show toggle when cart has items or in quick mode */}
        {(mode === "quick" || cart.length > 0) && (
          <>
            <Pressable
              style={s.customerToggleRow}
              onPress={() => setShowCustomer((v) => !v)}
            >
              <Feather
                name={showCustomer ? "user-check" : "user-plus"}
                size={15}
                color={colors.primary}
              />
              <Text style={s.customerToggleText}>
                {showCustomer
                  ? customerName
                    ? customerName
                    : "Customer (optional)"
                  : "Add customer (optional)"}
              </Text>
              <Feather
                name={showCustomer ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.primary}
              />
            </Pressable>

            {showCustomer && (
              <View style={s.customerFields}>
                <View style={s.inputRow}>
                  <Feather name="user" size={14} color={colors.mutedForeground} />
                  <TextInput
                    style={s.input}
                    placeholder="Customer name"
                    placeholderTextColor={colors.mutedForeground}
                    value={customerName}
                    onChangeText={setCustomerName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
                <View style={s.inputRow}>
                  <Feather name="phone" size={14} color={colors.mutedForeground} />
                  <TextInput
                    style={s.input}
                    placeholder="Phone number"
                    placeholderTextColor={colors.mutedForeground}
                    value={customerPhone}
                    onChangeText={setCustomerPhone}
                    keyboardType="phone-pad"
                    returnKeyType="done"
                    maxLength={10}
                  />
                </View>
              </View>
            )}
            
            {/* Payment Status Toggle */}
            <View style={s.paymentToggle}>
              <Pressable 
                style={[s.payBtn, paymentStatus === "paid" && s.payBtnActive]}
                onPress={() => { setPaymentStatus("paid"); Haptics.selectionAsync(); }}
              >
                <Feather name="check-circle" size={14} color={paymentStatus === "paid" ? "#16a34a" : colors.mutedForeground} />
                <Text style={[s.payText, paymentStatus === "paid" && { color: "#16a34a" }]}>Paid</Text>
              </Pressable>
              <Pressable 
                style={[s.payBtn, paymentStatus === "unpaid" && s.payBtnUnpaidActive]}
                onPress={() => { 
                  setPaymentStatus("unpaid"); 
                  setShowCustomer(true); // Force open customer section
                  Haptics.selectionAsync(); 
                }}
              >
                <Feather name="clock" size={14} color={paymentStatus === "unpaid" ? "#ea580c" : colors.mutedForeground} />
                <Text style={[s.payText, paymentStatus === "unpaid" && { color: "#ea580c" }]}>Pay Later</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Confirm button */}
        {mode === "items" ? (
          <Pressable
            style={[s.confirmBtn, cart.length === 0 && s.confirmBtnDisabled]}
            onPress={handleConfirmSale}
            disabled={cart.length === 0}
          >
            <Feather
              name="check-circle"
              size={18}
              color={cart.length === 0 ? colors.mutedForeground : "#fff"}
            />
            <Text
              style={[
                s.confirmBtnText,
                cart.length === 0 && s.confirmBtnTextDisabled,
              ]}
            >
              {cart.length === 0
                ? (t.selectItems ?? "Select items above")
                : `${t.createBill ?? "Confirm Sale"} · ${formatCurrency(cartTotal)}`}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={[s.confirmBtn, !quickAmount && s.confirmBtnDisabled]}
            onPress={handleQuickSale}
            disabled={!quickAmount}
          >
            <Feather
              name="zap"
              size={18}
              color={!quickAmount ? colors.mutedForeground : "#fff"}
            />
            <Text
              style={[
                s.confirmBtnText,
                !quickAmount && s.confirmBtnTextDisabled,
              ]}
            >
              {!quickAmount
                ? t.enterAmount ?? "Enter Amount"
                : `${t.confirmQuickSale ?? "Confirm Sale"} · ${formatCurrency(parseFloat(quickAmount) || 0)}`}
            </Text>
          </Pressable>
        )}
      </View>

      <ScannerModal
        visible={showScanner}
        onScan={handleScan}
        onClose={() => setShowScanner(false)}
      />

      <UnknownBarcodeModal
        visible={!!unknownBarcode}
        barcode={unknownBarcode}
        onClose={() => setUnknownBarcode("")}
        onQuickAdd={handleQuickAdd}
      />

      {scannedItemId && (
        <ScannedItemModal
          visible={!!scannedItemId}
          itemLabel={getCartItem(scannedItemId)?.localLabel || getCartItem(scannedItemId)?.label || "Item"}
          quantity={getCartItem(scannedItemId)?.quantity || 1}
          onClose={() => setScannedItemId(null)}
          onIncrement={() => {
            const item = inventoryItems.find((i) => i.id === scannedItemId);
            if (item) increment(item);
          }}
          onDecrement={() => decrement(scannedItemId)}
          onCancel={() => {
            setCart((prev) => prev.filter((c) => c.itemId !== scannedItemId));
            setScannedItemId(null);
          }}
        />
      )}

      <ReceiptModal
        visible={!!receiptSale}
        sale={receiptSale}
        onClose={() => setReceiptSale(null)}
      />

      {/* Set Fractional / Decimal Quantity Modal */}
      <Modal
        visible={!!editingQtyItem}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingQtyItem(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          onPress={() => setEditingQtyItem(null)}
        >
          <Pressable
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              paddingBottom: 32,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Grab handle */}
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
                alignSelf: "center",
                marginBottom: 16,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Inter_700Bold",
                    color: colors.foreground,
                  }}
                >
                  {editingQtyItem?.localLabel || editingQtyItem?.label}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Inter_500Medium",
                    color: colors.primary,
                    marginTop: 2,
                  }}
                >
                  Rate: ₹{editingQtyItem?.rate} / {editingQtyItem?.unit}
                </Text>
              </View>
              <Pressable onPress={() => setEditingQtyItem(null)}>
                <Feather name="x" size={22} color={colors.foreground} />
              </Pressable>
            </View>

            {/* Quantity Input */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.card,
                borderRadius: colors.radius,
                borderWidth: 2,
                borderColor: colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginBottom: 16,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 24,
                  fontFamily: "Inter_700Bold",
                  color: colors.foreground,
                }}
                value={qtyInput}
                onChangeText={setQtyInput}
                keyboardType="decimal-pad"
                placeholder="1"
                placeholderTextColor={colors.mutedForeground}
                autoFocus
                selectTextOnFocus
              />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: colors.mutedForeground,
                  marginLeft: 8,
                }}
              >
                {editingQtyItem?.unit}
              </Text>
            </View>

            {/* Quick Presets */}
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Inter_600SemiBold",
                color: colors.mutedForeground,
                textTransform: "uppercase",
                marginBottom: 8,
                letterSpacing: 0.5,
              }}
            >
              Quick Presets
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {(editingQtyItem &&
              ["kg", "liter", "meter", "gram"].includes(editingQtyItem.unit.toLowerCase())
                ? [0.25, 0.5, 0.75, 1, 1.5, 2, 5]
                : ["strip", "tablet"].includes(editingQtyItem?.unit.toLowerCase() || "")
                  ? [0.5, 1, 2, 5, 10]
                  : [1, 2, 3, 5, 10, 12]
              ).map((preset) => {
                const isSelected = parseFloat(qtyInput) === preset;
                return (
                  <Pressable
                    key={preset}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: isSelected ? colors.primary : colors.muted,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setQtyInput(preset.toString());
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Inter_600SemiBold",
                        color: isSelected ? "#FFFFFF" : colors.foreground,
                      }}
                    >
                      {preset} {editingQtyItem?.unit}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Live Subtotal Calculation */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.muted,
                padding: 12,
                borderRadius: colors.radius,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Inter_500Medium",
                  color: colors.mutedForeground,
                }}
              >
                Line Total:
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_700Bold",
                  color: colors.foreground,
                }}
              >
                ₹{(((parseFloat(qtyInput) || 0) * (editingQtyItem?.rate || 0))).toFixed(2)}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: colors.radius,
                  backgroundColor: "#FEE2E2",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#FECACA",
                }}
                onPress={() => {
                  if (editingQtyItem) {
                    setCart((prev) => prev.filter((c) => c.itemId !== editingQtyItem.itemId));
                    setEditingQtyItem(null);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Inter_600SemiBold",
                    color: colors.destructive,
                  }}
                >
                  Remove
                </Text>
              </Pressable>

              <Pressable
                style={{
                  flex: 2,
                  paddingVertical: 14,
                  borderRadius: colors.radius,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  const val = parseFloat(qtyInput);
                  if (isNaN(val) || val <= 0) {
                    Alert.alert("Invalid Quantity", "Please enter a quantity greater than 0.");
                    return;
                  }
                  if (editingQtyItem) {
                    setCart((prev) =>
                      prev.map((c) =>
                        c.itemId === editingQtyItem.itemId ? { ...c, quantity: val } : c
                      )
                    );
                    setEditingQtyItem(null);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Inter_700Bold",
                    color: "#FFFFFF",
                  }}
                >
                  Set Quantity
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
