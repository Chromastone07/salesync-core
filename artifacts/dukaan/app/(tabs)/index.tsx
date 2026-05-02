import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useStore } from "@/context/StoreContext";
import type { Sale } from "@/context/StoreContext";
import { useColors } from "@/hooks/useColors";
import { translations } from "@/constants/translations";
import { WeeklyChart } from "@/components/WeeklyChart";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m} ${ampm}`;
}

function formatCurrency(amount: number) {
  return `₹${amount.toFixed(0)}`;
}

function SaleCard({ sale }: { sale: Sale }) {
  const colors = useColors();
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    top: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      paddingBottom: 10,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: colors.successLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    info: { flex: 1 },
    time: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginBottom: 3,
    },
    itemNames: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      lineHeight: 18,
    },
    amount: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.success,
    },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 14 },
    itemsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      padding: 10,
      paddingTop: 8,
    },
    chip: {
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    chipText: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
  });

  const itemNames = sale.items
    .map((i) => `${i.label} ×${i.quantity}`)
    .join(" · ");

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.iconBox}>
          <Feather name="check" size={16} color={colors.success} />
        </View>
        <View style={styles.info}>
          <Text style={styles.time}>{formatTime(sale.date)}</Text>
          <Text style={styles.itemNames} numberOfLines={2}>
            {itemNames}
          </Text>
        </View>
        <Text style={styles.amount}>{formatCurrency(sale.total)}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.itemsRow}>
        {sale.items.map((item, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText}>
              {item.label} · {item.quantity} {item.unit} · ₹{item.total.toFixed(0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language, shopName } = useApp();
  const { sales, getTodaySales, getTodayTotal } = useStore();
  const t = translations[language];

  const todaySales = getTodaySales();
  const todayTotal = getTodayTotal();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
      paddingHorizontal: 20,
      paddingBottom: 0,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 20,
      paddingTop: 16,
    },
    appTitle: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
      letterSpacing: -0.5,
    },
    shopLabel: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    newSaleBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },
    newSaleBtnText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    statsCard: {
      borderRadius: colors.radius + 4,
      marginHorizontal: 20,
      marginBottom: 20,
      overflow: "hidden",
    },
    statsGradient: {
      padding: 24,
    },
    statsLabel: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: "rgba(255,255,255,0.75)",
      marginBottom: 6,
    },
    statsAmount: {
      fontSize: 42,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      letterSpacing: -1,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 12,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    statsCount: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: "#FFFFFF",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    salesList: {
      paddingHorizontal: 20,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 32,
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 4,
    },
    emptyText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    listBottom: { height: 160 },
  });

  return (
    <View style={styles.container}>
      {/* Fixed header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.appTitle}>Dukaan</Text>
            {shopName ? (
              <Text style={styles.shopLabel}>{shopName}</Text>
            ) : null}
          </View>
          <Pressable
            style={styles.newSaleBtn}
            onPress={() => router.push("/(tabs)/sale")}
          >
            <Feather name="plus" size={14} color="#FFFFFF" />
            <Text style={styles.newSaleBtnText}>{t.newSale}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Today's revenue card */}
        <View style={styles.statsCard}>
          <LinearGradient
            colors={["#F97316", "#EA580C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsGradient}
          >
            <Text style={styles.statsLabel}>{t.todaySales}</Text>
            <Text style={styles.statsAmount}>{formatCurrency(todayTotal)}</Text>
            <View style={styles.statsRow}>
              <Feather name="shopping-bag" size={12} color="#FFFFFF" />
              <Text style={styles.statsCount}>
                {todaySales.length} {t.salesCount}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* 7-day bar chart */}
        <WeeklyChart sales={sales} />

        {/* Today's sales list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.recentSales}</Text>
        </View>

        <View style={styles.salesList}>
          {todaySales.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Feather name="sunrise" size={24} color={colors.mutedForeground} />
              </View>
              <Text style={styles.emptyTitle}>{t.noSalesToday}</Text>
              <Text style={styles.emptyText}>{t.tapToAdd}</Text>
            </View>
          ) : (
            todaySales.map((sale) => <SaleCard key={sale.id} sale={sale} />)
          )}
        </View>

        <View style={styles.listBottom} />
      </ScrollView>
    </View>
  );
}
