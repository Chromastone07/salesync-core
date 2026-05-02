import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
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
import type { SaleLineItem } from "@/context/StoreContext";
import { useColors } from "@/hooks/useColors";
import { translations } from "@/constants/translations";

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
  return `₹${n.toFixed(0)}`;
}

export default function SaleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { inventoryItems, addSale } = useStore();
  const t = translations[language];

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCustomer, setShowCustomer] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const cartTotal = cart.reduce((s, i) => s + i.rate * i.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const getCartItem = (itemId: string) => cart.find((c) => c.itemId === itemId);

  const increment = (item: (typeof inventoryItems)[0]) => {
    Haptics.selectionAsync();
    const existing = cart.find((c) => c.itemId === item.id);
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
  };

  const handleConfirmSale = async () => {
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
    await addSale(lineItems, {
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
    });
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setShowCustomer(false);
    Alert.alert(
      t.billCreated ?? "Sale Recorded!",
      `${formatCurrency(cartTotal)} ${t.billCreatedSub ?? "added to today's register"}`,
      [{ text: "OK" }]
    );
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
    clearBtn: { flexDirection: "row", gap: 4, alignItems: "center" },
    clearText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.destructive,
    },
    scroll: { flex: 1 },
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
  });

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>{t.newSale}</Text>
        {cart.length > 0 && (
          <Pressable style={s.clearBtn} onPress={handleClearAll}>
            <Feather name="x" size={14} color={colors.destructive} />
            <Text style={s.clearText}>{t.clearCart}</Text>
          </Pressable>
        )}
      </View>

      {/* Item grid */}
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {inventoryItems.length === 0 ? (
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <Feather name="package" size={32} color={colors.mutedForeground} />
            </View>
            <Text style={s.emptyTitle}>{t.noItems}</Text>
            <Text style={s.emptySub}>{t.addFirstItem}</Text>
          </View>
        ) : (
          <>
            <Text style={s.sectionLabel}>{t.selectItems}</Text>
            <View style={s.grid}>
              {inventoryItems.map((item) => {
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
                        <Text style={s.qtyNum}>{cartItem!.quantity}</Text>
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
        <View style={s.spacer} />
      </ScrollView>

      {/* Bottom footer */}
      <View style={s.footer}>
        {/* Cart summary */}
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

        {/* Customer section — only show toggle when cart has items */}
        {cart.length > 0 && (
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
          </>
        )}

        {/* Confirm button */}
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
      </View>
    </View>
  );
}
