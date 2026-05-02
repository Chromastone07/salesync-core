import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useStore } from "@/context/StoreContext";
import type { Sale } from "@/context/StoreContext";
import { useColors } from "@/hooks/useColors";
import { translations } from "@/constants/translations";
import { downloadWeeklyCSV } from "@/utils/csvExport";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

function SaleCard({
  sale,
  onDelete,
}: {
  sale: Sale;
  onDelete: () => void;
}) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(true);

  const itemSummary = sale.items
    .map((i) => `${i.label} ×${i.quantity}${i.unit !== "piece" ? " " + i.unit : ""}`)
    .join(" · ");

  const hasCustomer = !!(sale.customerName || sale.customerPhone);

  const s = StyleSheet.create({
    card: {
      marginHorizontal: 16,
      marginBottom: 10,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 14,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: colors.successLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      marginTop: 2,
    },
    meta: { flex: 1 },
    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 4,
    },
    timeText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    customerBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.muted,
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      marginBottom: 5,
    },
    customerBadgeText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    itemSummary: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      lineHeight: 18,
    },
    right: {
      alignItems: "flex-end",
      gap: 6,
    },
    total: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.success,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    deleteBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "#FEE2E2",
      alignItems: "center",
      justifyContent: "center",
    },
    expandBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 14,
    },
    itemsList: {
      padding: 12,
      gap: 2,
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 5,
    },
    itemBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginRight: 10,
    },
    itemName: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    itemQty: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginRight: 12,
      minWidth: 50,
      textAlign: "right",
    },
    itemRate: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginRight: 12,
    },
    itemTotal: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      minWidth: 52,
      textAlign: "right",
    },
    subtotalRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      paddingTop: 6,
      marginTop: 4,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 8,
    },
    subtotalLabel: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    subtotalAmount: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
      color: colors.success,
      minWidth: 52,
      textAlign: "right",
    },
  });

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={s.iconBox}>
          <Feather name="check" size={16} color={colors.success} />
        </View>
        <View style={s.meta}>
          <View style={s.timeRow}>
            <Feather name="clock" size={11} color={colors.mutedForeground} />
            <Text style={s.timeText}>{formatTime(sale.date)}</Text>
          </View>
          {hasCustomer && (
            <View style={s.customerBadge}>
              <Feather name="user" size={11} color={colors.foreground} />
              <Text style={s.customerBadgeText}>
                {[sale.customerName, sale.customerPhone]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
          )}
          <Text style={s.itemSummary} numberOfLines={expanded ? undefined : 1}>
            {itemSummary}
          </Text>
        </View>
        <View style={s.right}>
          <Text style={s.total}>₹{sale.total.toFixed(0)}</Text>
          <View style={s.actions}>
            <Pressable
              style={s.expandBtn}
              onPress={() => setExpanded((v) => !v)}
            >
              <Feather
                name={expanded ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.mutedForeground}
              />
            </Pressable>
            <Pressable style={s.deleteBtn} onPress={onDelete}>
              <Feather name="trash-2" size={13} color={colors.destructive} />
            </Pressable>
          </View>
        </View>
      </View>

      {expanded && (
        <>
          <View style={s.divider} />
          <View style={s.itemsList}>
            {sale.items.map((item, idx) => (
              <View key={idx} style={s.itemRow}>
                <View style={s.itemBullet} />
                <Text style={s.itemName} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={s.itemQty}>
                  {item.quantity} {item.unit}
                </Text>
                <Text style={s.itemRate}>@₹{item.rate}</Text>
                <Text style={s.itemTotal}>₹{item.total.toFixed(0)}</Text>
              </View>
            ))}
            <View style={s.subtotalRow}>
              <Text style={s.subtotalLabel}>Bill Total</Text>
              <Text style={s.subtotalAmount}>₹{sale.total.toFixed(0)}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { sales, deleteSale } = useStore();
  const t = translations[language];
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSales = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter((s) => {
      const nameMatch = s.customerName?.toLowerCase().includes(q);
      const phoneMatch = s.customerPhone?.toLowerCase().includes(q);
      return nameMatch || phoneMatch;
    });
  }, [sales, searchQuery]);

  const groups = groupSalesByDate(filteredSales);

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

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await downloadWeeklyCSV(sales);
    } catch {
      Alert.alert("Export Failed", "Could not generate the report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
      paddingHorizontal: 20,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    exportBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.muted,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exportBtnText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: exporting ? colors.mutedForeground : colors.foreground,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 4,
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
    noResultsText: {
      textAlign: "center",
      marginTop: 40,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    dateHeader: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dateLabel: {
      fontSize: 12,
      fontFamily: "Inter_700Bold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    dateTotalChip: {
      backgroundColor: colors.successLight,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 12,
    },
    dateTotalText: {
      fontSize: 12,
      fontFamily: "Inter_700Bold",
      color: colors.success,
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.salesHistory}</Text>
        <Pressable
          style={styles.exportBtn}
          onPress={handleExport}
          disabled={exporting || sales.length === 0}
        >
          <Feather
            name={exporting ? "loader" : "download"}
            size={14}
            color={exporting ? colors.mutedForeground : colors.foreground}
          />
          <Text style={styles.exportBtnText}>
            {exporting ? "Exporting…" : "Weekly CSV"}
          </Text>
        </Pressable>
      </View>

      {/* Customer search bar */}
      {sales.length > 0 && (
        <View style={styles.searchBar}>
          <Feather name="search" size={14} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer name or phone…"
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable
              style={styles.searchClear}
              onPress={() => setSearchQuery("")}
            >
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      )}

      {sales.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="clock" size={32} color={colors.mutedForeground} />
          </View>
          <Text style={styles.emptyTitle}>{t.noHistory}</Text>
          <Text style={styles.emptyText}>{t.tapToAdd}</Text>
        </View>
      ) : filteredSales.length === 0 ? (
        <Text style={styles.noResultsText}>
          No sales found for "{searchQuery}"
        </Text>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(g) => g.date}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: group }) => {
            const groupTotal = group.sales.reduce((s, g) => s + g.total, 0);
            return (
              <View>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateLabel}>{formatDate(group.date)}</Text>
                  <View style={styles.dateTotalChip}>
                    <Text style={styles.dateTotalText}>
                      ₹{groupTotal.toFixed(0)}
                    </Text>
                  </View>
                </View>
                {group.sales.map((sale) => (
                  <SaleCard
                    key={sale.id}
                    sale={sale}
                    onDelete={() => handleDelete(sale)}
                  />
                ))}
              </View>
            );
          }}
          ListFooterComponent={<View style={styles.listBottom} />}
        />
      )}
    </View>
  );
}
