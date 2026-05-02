import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useStore } from "@/context/StoreContext";
import type { Sale } from "@/context/StoreContext";
import { useColors } from "@/hooks/useColors";
import { translations } from "@/constants/translations";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m} ${ampm}`;
}

function groupSalesByDate(sales: Sale[]): { date: string; sales: Sale[] }[] {
  const groups: Record<string, Sale[]> = {};
  for (const sale of sales) {
    const key = new Date(sale.date).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(sale);
  }
  return Object.entries(groups).map(([_, s]) => ({
    date: s[0].date,
    sales: s,
  }));
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { sales, deleteSale } = useStore();
  const t = translations[language];

  const groups = groupSalesByDate(sales);

  const handleDelete = (sale: Sale) => {
    Alert.alert(t.deleteConfirm, `${sale.items.length} items — ₹${sale.total}`, [
      { text: t.no, style: "cancel" },
      {
        text: t.yes,
        style: "destructive",
        onPress: () => deleteSale(sale.id),
      },
    ]);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    dateSection: { marginBottom: 8 },
    dateHeader: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dateLabel: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    dateTotalText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.success,
    },
    saleCard: {
      marginHorizontal: 16,
      marginBottom: 8,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    saleHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    saleIconBox: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: colors.successLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    saleTime: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    saleItems: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    saleTotal: {
      flex: 1,
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.success,
      textAlign: "right",
    },
    deleteBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "#FEE2E2",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 10,
    },
    itemsList: { paddingHorizontal: 14, paddingVertical: 8, gap: 4 },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
    },
    itemDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.primary,
      marginRight: 10,
    },
    itemRowLabel: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    itemRowQty: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    itemRowTotal: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      minWidth: 60,
      textAlign: "right",
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
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    emptyText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 6,
    },
    listBottom: { height: 160 },
  });

  if (sales.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.salesHistory}</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="clock" size={32} color={colors.mutedForeground} />
          </View>
          <Text style={styles.emptyTitle}>{t.noHistory}</Text>
          <Text style={styles.emptyText}>{t.tapToAdd}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.salesHistory}</Text>
      </View>
      <FlatList
        data={groups}
        keyExtractor={(g) => g.date}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: group }) => {
          const groupTotal = group.sales.reduce((s, g) => s + g.total, 0);
          return (
            <View style={styles.dateSection}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateLabel}>{formatDate(group.date)}</Text>
                <Text style={styles.dateTotalText}>₹{groupTotal.toFixed(0)}</Text>
              </View>
              {group.sales.map((sale) => (
                <View key={sale.id} style={styles.saleCard}>
                  <View style={styles.saleHeader}>
                    <View style={styles.saleIconBox}>
                      <Feather name="shopping-bag" size={16} color={colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.saleTime}>{formatTime(sale.date)}</Text>
                      <Text style={styles.saleItems}>
                        {sale.items.length} {sale.items.length === 1 ? "item" : "items"}
                      </Text>
                    </View>
                    <Text style={styles.saleTotal}>₹{sale.total.toFixed(0)}</Text>
                    <Pressable
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(sale)}
                    >
                      <Feather name="trash-2" size={13} color={colors.destructive} />
                    </Pressable>
                  </View>
                  <View style={styles.itemsList}>
                    {sale.items.map((item, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <View style={styles.itemDot} />
                        <Text style={styles.itemRowLabel} numberOfLines={1}>
                          {item.label}
                        </Text>
                        <Text style={styles.itemRowQty}>
                          {item.quantity} {item.unit}
                        </Text>
                        <Text style={styles.itemRowTotal}>
                          ₹{item.total.toFixed(0)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          );
        }}
        ListFooterComponent={<View style={styles.listBottom} />}
      />
    </View>
  );
}
