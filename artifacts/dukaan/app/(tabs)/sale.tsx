import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
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
  const [showBill, setShowBill] = useState(false);

  const cartTotal = cart.reduce((s, i) => s + i.rate * i.quantity, 0);

  const getCartItem = (itemId: string) =>
    cart.find((c) => c.itemId === itemId);

  const addToCart = (item: (typeof inventoryItems)[0]) => {
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

  const removeFromCart = (itemId: string) => {
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

  const updateQty = (itemId: string, val: string) => {
    const qty = parseFloat(val) || 0;
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.itemId !== itemId));
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.itemId === itemId ? { ...c, quantity: qty } : c))
    );
  };

  const handleCreateBill = async () => {
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
    await addSale(lineItems);
    setCart([]);
    setShowBill(false);
    Alert.alert(t.billCreated, `${formatCurrency(cartTotal)}`);
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
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    clearBtn: {
      flexDirection: "row",
      gap: 4,
      alignItems: "center",
    },
    clearText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.destructive,
    },
    body: { flex: 1 },
    sectionLabel: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 14,
      gap: 10,
    },
    itemTile: {
      width: "30%",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    itemTileActive: {
      borderColor: colors.primary,
      backgroundColor: "#FFF7ED",
    },
    tileLabel: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      textAlign: "center",
      marginTop: 6,
    },
    tileRate: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    tileQtyBadge: {
      position: "absolute",
      top: -6,
      right: -6,
      backgroundColor: colors.primary,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    tileQtyText: {
      fontSize: 11,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    emptyInventory: {
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
    emptyText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      textAlign: "center",
    },
    emptySubtext: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 6,
    },
    cartBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
    },
    cartHandle: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      paddingBottom: cart.length > 0 && !showBill ? 8 : 16,
    },
    cartSummaryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    cartCount: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    cartCountText: {
      fontSize: 13,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    cartTotalText: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    createBillBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingHorizontal: 20,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    createBillText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    cartEmpty: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    cartEmptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    cartDetails: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      maxHeight: 220,
    },
    cartLineRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cartLineLabel: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    qtyControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginRight: 8,
    },
    qtyBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    qtyInput: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      minWidth: 36,
      textAlign: "center",
    },
    cartLineTotal: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.success,
      minWidth: 60,
      textAlign: "right",
    },
    listBottom: { height: 160 },
  });

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.newSale}</Text>
        {cart.length > 0 && (
          <Pressable style={styles.clearBtn} onPress={() => setCart([])}>
            <Feather name="x" size={14} color={colors.destructive} />
            <Text style={styles.clearText}>{t.clearCart}</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {inventoryItems.length === 0 ? (
          <View style={styles.emptyInventory}>
            <View style={styles.emptyIcon}>
              <Feather name="package" size={32} color={colors.mutedForeground} />
            </View>
            <Text style={styles.emptyText}>{t.noItems}</Text>
            <Text style={styles.emptySubtext}>{t.addFirstItem}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>{t.selectItems}</Text>
            <View style={styles.grid}>
              {inventoryItems.map((item) => {
                const cartItem = getCartItem(item.id);
                const isActive = !!cartItem;
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.itemTile, isActive && styles.itemTileActive]}
                    onPress={() => addToCart(item)}
                  >
                    {isActive && (
                      <View style={styles.tileQtyBadge}>
                        <Text style={styles.tileQtyText}>
                          {cartItem?.quantity}
                        </Text>
                      </View>
                    )}
                    <Feather
                      name={item.isService ? "zap" : "box"}
                      size={22}
                      color={isActive ? colors.primary : colors.mutedForeground}
                    />
                    <Text style={styles.tileLabel} numberOfLines={2}>
                      {item.localLabel || item.label}
                    </Text>
                    <Text style={styles.tileRate}>
                      ₹{item.rate}/{item.unit}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
        <View style={styles.listBottom} />
      </ScrollView>

      <View style={styles.cartBar}>
        {showBill && cart.length > 0 && (
          <ScrollView style={styles.cartDetails} showsVerticalScrollIndicator={false}>
            {cart.map((cartItem) => (
              <View key={cartItem.itemId} style={styles.cartLineRow}>
                <Text style={styles.cartLineLabel} numberOfLines={1}>
                  {cartItem.localLabel || cartItem.label}
                </Text>
                <View style={styles.qtyControls}>
                  <Pressable
                    style={styles.qtyBtn}
                    onPress={() => removeFromCart(cartItem.itemId)}
                  >
                    <Feather name="minus" size={12} color={colors.foreground} />
                  </Pressable>
                  <TextInput
                    style={styles.qtyInput}
                    value={cartItem.quantity.toString()}
                    onChangeText={(v) => updateQty(cartItem.itemId, v)}
                    keyboardType="numeric"
                    selectTextOnFocus
                  />
                  <Pressable
                    style={styles.qtyBtn}
                    onPress={() => addToCart(inventoryItems.find((i) => i.id === cartItem.itemId)!)}
                  >
                    <Feather name="plus" size={12} color={colors.foreground} />
                  </Pressable>
                </View>
                <Text style={styles.cartLineTotal}>
                  {formatCurrency(cartItem.rate * cartItem.quantity)}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.cartHandle}>
          {cart.length === 0 ? (
            <View style={styles.cartEmpty}>
              <Feather name="shopping-bag" size={18} color={colors.mutedForeground} />
              <Text style={styles.cartEmptyText}>{t.emptyCart}</Text>
            </View>
          ) : (
            <>
              <Pressable
                style={styles.cartSummaryRow}
                onPress={() => setShowBill((v) => !v)}
              >
                <View style={styles.cartCount}>
                  <Text style={styles.cartCountText}>
                    {Math.round(cartCount)}
                  </Text>
                </View>
                <Text style={styles.cartTotalText}>
                  {formatCurrency(cartTotal)}
                </Text>
                <Feather
                  name={showBill ? "chevron-down" : "chevron-up"}
                  size={16}
                  color={colors.mutedForeground}
                />
              </Pressable>
              <Pressable style={styles.createBillBtn} onPress={handleCreateBill}>
                <Feather name="check" size={14} color="#FFFFFF" />
                <Text style={styles.createBillText}>{t.createBill}</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}
