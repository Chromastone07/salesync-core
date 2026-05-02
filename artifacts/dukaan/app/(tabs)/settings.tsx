import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
import { useColors } from "@/hooks/useColors";
import {
  BUSINESS_TYPES,
  LANGUAGES,
  type Language,
  translations,
} from "@/constants/translations";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    language,
    businessType,
    shopName,
    setLanguage,
    setShopName,
    resetApp,
  } = useApp();
  const { sales, inventoryItems } = useStore();
  const t = translations[language];
  const [editingShop, setEditingShop] = useState(false);
  const [shopInput, setShopInput] = useState(shopName);

  const businessLabel = BUSINESS_TYPES.find((b) => b.type === businessType);
  const businessName =
    language === "hi"
      ? businessLabel?.hi
      : language === "mr"
        ? businessLabel?.mr
        : businessLabel?.en;

  const handleLanguageChange = async (lang: Language) => {
    Haptics.selectionAsync();
    await setLanguage(lang);
  };

  const handleSaveShop = async () => {
    await setShopName(shopInput.trim());
    setEditingShop(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReset = () => {
    Alert.alert(
      "Reset App",
      "This will delete ALL your data including inventory and sales history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            await resetApp();
            router.replace("/onboarding/language");
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
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
    statsCard: {
      margin: 16,
      borderRadius: colors.radius,
      overflow: "hidden",
    },
    statsGradient: {
      padding: 20,
      flexDirection: "row",
      gap: 24,
    },
    statItem: { flex: 1, alignItems: "center" },
    statValue: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    statLabel: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.75)",
      marginTop: 4,
    },
    statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.25)" },
    section: { marginBottom: 8 },
    sectionLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowFirst: { borderTopWidth: 1, borderTopColor: colors.border },
    rowIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    rowLabel: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    rowValue: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    langRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 8,
    },
    langChip: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: colors.radius - 4,
      backgroundColor: colors.muted,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    langChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    langChipText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    langChipTextActive: { color: "#FFFFFF" },
    shopInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      paddingVertical: 0,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    saveBtnText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    guestCard: {
      margin: 16,
      backgroundColor: "#FFF7ED",
      borderRadius: colors.radius,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      borderWidth: 1,
      borderColor: "#FED7AA",
    },
    guestIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    guestInfo: { flex: 1 },
    guestTitle: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#7C2D12",
    },
    guestDesc: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "#9A3412",
      marginTop: 2,
    },
    resetBtn: {
      margin: 16,
      marginTop: 8,
      padding: 16,
      borderRadius: colors.radius,
      backgroundColor: "#FEE2E2",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#FECACA",
    },
    resetBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.destructive,
    },
    listBottom: { height: 60 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.settings}</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <LinearGradient
            colors={["#1E293B", "#334155"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsGradient}
          >
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{inventoryItems.length}</Text>
              <Text style={styles.statLabel}>{t.inventory}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sales.length}</Text>
              <Text style={styles.statLabel}>{t.salesHistory}</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.shopName}</Text>
          <View style={[styles.row, styles.rowFirst]}>
            <View style={styles.rowIcon}>
              <Feather name="home" size={16} color={colors.primary} />
            </View>
            {editingShop ? (
              <>
                <TextInput
                  style={styles.shopInput}
                  value={shopInput}
                  onChangeText={setShopInput}
                  placeholder={t.shopNameHint}
                  placeholderTextColor={colors.mutedForeground}
                  autoFocus
                />
                <Pressable style={styles.saveBtn} onPress={handleSaveShop}>
                  <Text style={styles.saveBtnText}>{t.save}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.rowLabel}>
                  {shopName || t.shopNameHint}
                </Text>
                <Pressable onPress={() => { setShopInput(shopName); setEditingShop(true); }}>
                  <Feather name="edit-2" size={16} color={colors.mutedForeground} />
                </Pressable>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.language}</Text>
          <View style={[styles.langRow, styles.rowFirst]}>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                style={[
                  styles.langChip,
                  language === lang.code && styles.langChipActive,
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text
                  style={[
                    styles.langChipText,
                    language === lang.code && styles.langChipTextActive,
                  ]}
                >
                  {lang.native}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.businessType}</Text>
          <View style={[styles.row, styles.rowFirst]}>
            <View style={styles.rowIcon}>
              <Feather name="briefcase" size={16} color={colors.primary} />
            </View>
            <Text style={styles.rowLabel}>{businessName}</Text>
          </View>
        </View>

        <View style={styles.guestCard}>
          <View style={styles.guestIcon}>
            <Feather name="shield" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.guestInfo}>
            <Text style={styles.guestTitle}>{t.guestMode}</Text>
            <Text style={styles.guestDesc}>{t.backupDesc}</Text>
          </View>
          <Feather name="cloud" size={20} color={colors.primary} />
        </View>

        <Pressable style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>Reset App</Text>
        </Pressable>

        <View style={styles.listBottom} />
      </ScrollView>
    </View>
  );
}
