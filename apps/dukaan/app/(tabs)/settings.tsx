import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
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
  type BusinessType,
  translations,
  SUGGESTED_ITEMS,
} from "@/constants/translations";
import { useBackupReminder } from "@/hooks/useBackupReminder";
import { StoreSwitcherModal } from "@/components/StoreSwitcherModal";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    language,
    businessType,
    shopName,
    shopPhone,
    shopUpi,
    shopAddress,
    backupEmail,
    setLanguage,
    setBusinessType,
    setShopName,
    setShopPhone,
    setShopUpi,
    setShopAddress,
    setBackupEmail,
    restoreProfile,
    resetApp,
    isAppLockEnabled,
    setAppLockEnabled,
    stores,
    activeStoreId,
    deleteStore,
  } = useApp();

  const { sales, inventoryItems, clearStore, exportData, importData, addInventoryItems } = useStore();
  const t = translations[language] || translations.en;

  const [showStoreSwitcher, setShowStoreSwitcher] = useState(false);

  // Inline editing states for store profile
  const [editingShop, setEditingShop] = useState(false);
  const [shopInput, setShopInput] = useState(shopName);

  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(shopPhone);

  const [editingUpi, setEditingUpi] = useState(false);
  const [upiInput, setUpiInput] = useState(shopUpi);

  const [editingAddress, setEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(shopAddress);

  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(backupEmail);

  useEffect(() => {
    setShopInput(shopName);
  }, [shopName]);

  useEffect(() => {
    setPhoneInput(shopPhone);
  }, [shopPhone]);

  useEffect(() => {
    setUpiInput(shopUpi);
  }, [shopUpi]);

  useEffect(() => {
    setAddressInput(shopAddress);
  }, [shopAddress]);

  useEffect(() => {
    setEmailInput(backupEmail);
  }, [backupEmail]);

  const [showDangerZone, setShowDangerZone] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const { frequency, setFrequency } = useBackupReminder();

  const businessLabel = BUSINESS_TYPES.find((b) => b.type === businessType);
  const businessName =
    language === "hi"
      ? businessLabel?.hi
      : language === "mr"
        ? businessLabel?.mr
        : businessLabel?.en;

  const totalRevenue = sales.reduce((acc, s) => acc + (s.total || 0), 0);

  const handleLanguageChange = async (lang: Language) => {
    Haptics.selectionAsync();
    await setLanguage(lang);
  };

  const handleSaveShop = async () => {
    await setShopName(shopInput.trim());
    setEditingShop(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSavePhone = async () => {
    await setShopPhone(phoneInput.trim());
    setEditingPhone(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveUpi = async () => {
    await setShopUpi(upiInput.trim());
    setEditingUpi(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveAddress = async () => {
    await setShopAddress(addressInput.trim());
    setEditingAddress(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveEmail = async () => {
    await setBackupEmail(emailInput.trim().toLowerCase());
    setEditingEmail(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLoadStarterCatalog = async (targetType: BusinessType = businessType) => {
    const suggested = SUGGESTED_ITEMS[targetType] ?? SUGGESTED_ITEMS.other;
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
            : "Starter items for this shop category are already in your inventory."
      );
      return;
    }

    await addInventoryItems(toAdd);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      language === "hi" ? "सफलता" : language === "mr" ? "यशस्वी" : "Success",
      `${toAdd.length} ${t.starterItemsSuccess}`
    );
  };

  const handleToggleAppLock = async (enable: boolean) => {
    if (enable) {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware) {
          Alert.alert(
            "Hardware Not Supported",
            "This device does not have biometric or secure screen lock hardware."
          );
          return;
        }

        if (!isEnrolled) {
          Alert.alert(
            "No Lock Screen Set",
            "Please configure a fingerprint, face, or PIN lock in your device settings before enabling App Lock."
          );
          return;
        }

        const auth = await LocalAuthentication.authenticateAsync({
          promptMessage: "Authenticate to enable SaleSync App Lock",
          fallbackLabel: "Use Device PIN",
          disableDeviceFallback: false,
        });

        if (auth.success) {
          await setAppLockEnabled(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Alert.alert("Authentication Cancelled", "App Lock was not enabled.");
        }
      } catch (e) {
        Alert.alert("Error", "Could not verify biometric authentication.");
      }
    } else {
      // Require owner verification before disabling security!
      try {
        const auth = await LocalAuthentication.authenticateAsync({
          promptMessage: "Authenticate to turn off App Lock",
          fallbackLabel: "Use Device PIN",
          disableDeviceFallback: false,
        });

        if (auth.success) {
          await setAppLockEnabled(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Alert.alert("Authentication Required", "App Lock remains active.");
        }
      } catch (e) {
        Alert.alert("Error", "Authentication required to disable App Lock.");
      }
    }
  };

  const handleExport = async () => {
    try {
      await exportData({
        shopName,
        shopPhone,
        shopUpi,
        shopAddress,
        backupEmail,
        businessType,
        language,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Export Error", "Could not export backup file.");
    }
  };

  const handleImport = async () => {
    try {
      const success = await importData(async ({ itemCount, saleCount, profile }) => {
        return new Promise<boolean>((resolve) => {
          Alert.alert(
            "Restore Store Data",
            `Found ${itemCount} items and ${saleCount} sales in this backup.\n\nRestoring will replace current device data. Would you like to proceed?`,
            [
              { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
              {
                text: "Restore & Replace",
                style: "destructive",
                onPress: async () => {
                  if (profile) {
                    await restoreProfile(profile);
                  }
                  resolve(true);
                },
              },
            ]
          );
        });
      });

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "Store data has been restored successfully!");
      }
    } catch (e: any) {
      Alert.alert("Import Failed", e?.message || "Invalid backup file.");
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message:
          "Manage your dukaan easily with SaleSync - Fast barcode billing, offline inventory register, and instant WhatsApp customer receipts! Download on Google Play: https://play.google.com/store/apps/details?id=com.chromastone07.salesync",
        title: "SaleSync - Digital Register",
      });
    } catch (e) {}
  };

  const handleRateApp = async () => {
    const playStoreUrl = "market://details?id=com.chromastone07.salesync";
    const webUrl = "https://play.google.com/store/apps/details?id=com.chromastone07.salesync";
    try {
      const canOpen = await Linking.canOpenURL(playStoreUrl);
      if (canOpen) {
        await Linking.openURL(playStoreUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (e) {
      await WebBrowser.openBrowserAsync(webUrl);
    }
  };

  const handleOpenPrivacyPolicy = async () => {
    try {
      await WebBrowser.openBrowserAsync("https://salesync.app/privacy");
    } catch (e) {
      setShowPrivacyModal(true);
    }
  };

  const handleOpenTerms = async () => {
    try {
      await WebBrowser.openBrowserAsync("https://salesync.app/terms");
    } catch (e) {
      Alert.alert(
        "Terms of Service",
        "SaleSync is provided as-is for local shop management. You retain 100% ownership of your store data."
      );
    }
  };

  const handleContactSupport = async () => {
    const email = "support@salesync.app";
    const url = `mailto:${email}?subject=SaleSync Support & Feedback`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Contact Support", `For questions or support, email us at:\n${email}`);
      }
    } catch (e) {
      Alert.alert("Contact Support", `For questions or support, email us at:\n${email}`);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Backup Recommended",
      "Do you want to export a backup of your data before resetting the app?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip & Reset",
          style: "destructive",
          onPress: performReset,
        },
        {
          text: "Backup Now",
          onPress: async () => {
            try {
              await exportData({
                shopName,
                shopPhone,
                shopUpi,
                shopAddress,
                businessType,
                language,
              });
              performReset();
            } catch (e) {
              Alert.alert(
                "Backup Incomplete",
                "Backup was cancelled or failed. Do you still want to reset?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Reset Anyway", style: "destructive", onPress: performReset },
                ]
              );
            }
          },
        },
      ]
    );
  };

  const handleResetActiveStore = () => {
    Alert.alert(
      `Reset "${shopName || "Store"}"`,
      `This will clear all inventory items and sales history for "${shopName || "Store"}". Your other shop profiles will NOT be affected.\n\nDo you want to proceed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Store Data",
          style: "destructive",
          onPress: async () => {
            await clearStore();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Store Cleared", `Data for "${shopName || "Store"}" has been cleared.`);
          },
        },
      ]
    );
  };

  const handleDeleteActiveStore = () => {
    if (stores.length <= 1) {
      Alert.alert("Cannot Delete", t.cannotDeleteOnlyStore);
      return;
    }

    Alert.alert(
      t.deleteStore,
      `${t.deleteStoreConfirm}\n\n"${shopName || "Store"}"\n\nAll items and sales for this store will be permanently deleted. Other stores will remain completely safe.`,
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.delete,
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await deleteStore(activeStoreId);
              Alert.alert("Store Deleted", `"${shopName || "Store"}" profile was removed.`);
            } catch (e: any) {
              Alert.alert("Error", e?.message || "Could not delete store.");
            }
          },
        },
      ]
    );
  };

  const performReset = () => {
    Alert.alert(
      "Final Warning: Reset App",
      "Are you absolutely sure? This will delete ALL your data including inventory and sales history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            await clearStore();
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
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statItem: { flex: 1, alignItems: "center" },
    statValue: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    statLabel: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.75)",
      marginTop: 4,
    },
    statDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.2)" },
    section: { marginBottom: 12 },
    sectionLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 6,
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
    rowContent: { flex: 1 },
    rowLabel: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    rowValue: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    rowInput: {
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
    privacyCard: {
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 12,
      backgroundColor: "#F0FDF4",
      borderRadius: colors.radius,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: "#BBF7D0",
    },
    privacyCardText: {
      flex: 1,
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "#166534",
      lineHeight: 18,
    },
    versionFooter: {
      paddingVertical: 24,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    versionText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
    },
    versionSubtext: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      opacity: 0.8,
    },
    listBottom: { height: 120 },
    // Privacy Policy Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "85%",
      padding: 20,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    modalBody: {
      paddingVertical: 16,
    },
    policyHeading: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginTop: 12,
      marginBottom: 4,
    },
    policyText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.settings}</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Overview Stats Card */}
        <View style={styles.statsCard}>
          <LinearGradient
            colors={["#0F172A", "#1E293B"]}
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
              <Text style={styles.statLabel}>{t.salesCount}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{totalRevenue.toFixed(0)}</Text>
              <Text style={styles.statLabel}>{t.totalRevenue}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Shop Profiles (Split Store) Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.stores} (Split Store)</Text>
          <Pressable onPress={() => setShowStoreSwitcher(true)}>
            <View style={[styles.row, styles.rowFirst, { backgroundColor: "#F0F9FF" }]}>
              <View style={[styles.rowIcon, { backgroundColor: "#BAE6FD" }]}>
                <Feather name="layers" size={16} color="#0284C7" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { fontFamily: "Inter_700Bold", color: "#0369A1" }]}>
                  {shopName || "My Store"} ({businessName})
                </Text>
                <Text style={[styles.rowValue, { color: "#0284C7" }]}>
                  {stores.length} shop profile(s) · Tap to switch or add
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "#0284C7",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" }}>
                  {t.switchStore}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Store Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Store Profile</Text>

          {/* Shop Name */}
          <View style={[styles.row, styles.rowFirst]}>
            <View style={styles.rowIcon}>
              <Feather name="home" size={16} color={colors.primary} />
            </View>
            {editingShop ? (
              <>
                <TextInput
                  style={styles.rowInput}
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
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>{shopName || t.shopNameHint}</Text>
                  <Text style={styles.rowValue}>Printed on receipts header</Text>
                </View>
                <Pressable onPress={() => { setShopInput(shopName); setEditingShop(true); }}>
                  <Feather name="edit-2" size={16} color={colors.mutedForeground} />
                </Pressable>
              </>
            )}
          </View>

          {/* Store Phone Number */}
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name="phone" size={16} color={colors.primary} />
            </View>
            {editingPhone ? (
              <>
                <TextInput
                  style={styles.rowInput}
                  value={phoneInput}
                  onChangeText={setPhoneInput}
                  placeholder="e.g. +91 98765 43210"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                  autoFocus
                />
                <Pressable style={styles.saveBtn} onPress={handleSavePhone}>
                  <Text style={styles.saveBtnText}>{t.save}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>{shopPhone || "Add Phone Number"}</Text>
                  <Text style={styles.rowValue}>Customer WhatsApp & contact number</Text>
                </View>
                <Pressable onPress={() => { setPhoneInput(shopPhone); setEditingPhone(true); }}>
                  <Feather name="edit-2" size={16} color={colors.mutedForeground} />
                </Pressable>
              </>
            )}
          </View>

          {/* Store UPI ID */}
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name="credit-card" size={16} color={colors.primary} />
            </View>
            {editingUpi ? (
              <>
                <TextInput
                  style={styles.rowInput}
                  value={upiInput}
                  onChangeText={setUpiInput}
                  placeholder="e.g. merchant@upi or 9876543210@paytm"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="none"
                  autoFocus
                />
                <Pressable style={styles.saveBtn} onPress={handleSaveUpi}>
                  <Text style={styles.saveBtnText}>{t.save}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>{shopUpi || "Add UPI ID (for bills)"}</Text>
                  <Text style={styles.rowValue}>Printed on receipts for instant payment</Text>
                </View>
                <Pressable onPress={() => { setUpiInput(shopUpi); setEditingUpi(true); }}>
                  <Feather name="edit-2" size={16} color={colors.mutedForeground} />
                </Pressable>
              </>
            )}
          </View>

          {/* Store Address */}
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name="map-pin" size={16} color={colors.primary} />
            </View>
            {editingAddress ? (
              <>
                <TextInput
                  style={styles.rowInput}
                  value={addressInput}
                  onChangeText={setAddressInput}
                  placeholder="e.g. Main Market, Station Road"
                  placeholderTextColor={colors.mutedForeground}
                  autoFocus
                />
                <Pressable style={styles.saveBtn} onPress={handleSaveAddress}>
                  <Text style={styles.saveBtnText}>{t.save}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>{shopAddress || "Add Address / Locality"}</Text>
                  <Text style={styles.rowValue}>Displays on invoices & receipts</Text>
                </View>
                <Pressable onPress={() => { setAddressInput(shopAddress); setEditingAddress(true); }}>
                  <Feather name="edit-2" size={16} color={colors.mutedForeground} />
                </Pressable>
              </>
            )}
          </View>

          {/* Backup Email ID */}
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name="mail" size={16} color={colors.primary} />
            </View>
            {editingEmail ? (
              <>
                <TextInput
                  style={styles.rowInput}
                  value={emailInput}
                  onChangeText={setEmailInput}
                  placeholder="e.g. mydukaan@gmail.com"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                />
                <Pressable style={styles.saveBtn} onPress={handleSaveEmail}>
                  <Text style={styles.saveBtnText}>{t.save}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>{backupEmail || "Add Backup Email ID"}</Text>
                  <Text style={styles.rowValue}>Pre-fills recipient for Google Drive & Email</Text>
                </View>
                <Pressable onPress={() => { setEmailInput(backupEmail); setEditingEmail(true); }}>
                  <Feather name="edit-2" size={16} color={colors.mutedForeground} />
                </Pressable>
              </>
            )}
          </View>

          {/* Business Type */}
          <Pressable onPress={() => setShowCategoryModal(true)}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Feather name="briefcase" size={16} color={colors.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>{businessName}</Text>
                <Text style={styles.rowValue}>Tap to change shop category</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>
          </Pressable>

          {/* Quick Starter Catalog Action */}
          <Pressable onPress={() => handleLoadStarterCatalog()}>
            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: "#FEF3C7" }]}>
                <Feather name="layers" size={16} color="#D97706" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>{t.loadStarterItems}</Text>
                <Text style={styles.rowValue}>Add popular items for {businessName} to catalog</Text>
              </View>
              <Feather name="plus-circle" size={18} color="#D97706" />
            </View>
          </Pressable>
        </View>

        {/* Language Selection */}
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

        {/* Security & Device Lock */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Security & Privacy</Text>
          <View style={[styles.row, styles.rowFirst]}>
            <View style={styles.rowIcon}>
              <Feather name="lock" size={16} color={colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Biometric App Lock</Text>
              <Text style={styles.rowValue}>Require fingerprint, face, or PIN to open</Text>
            </View>
            <Switch
              value={isAppLockEnabled}
              onValueChange={handleToggleAppLock}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor={"#ffffff"}
            />
          </View>

          {/* 100% Offline Privacy Badge */}
          <View style={styles.privacyCard}>
            <Feather name="shield" size={20} color="#166534" />
            <Text style={styles.privacyCardText}>
              <Text style={{ fontFamily: "Inter_700Bold" }}>100% On-Device Privacy:</Text> Your
              sales, inventory, and customer contacts never leave this device.
            </Text>
          </View>
        </View>

        {/* Data & Backup */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Data & Backup</Text>

          {/* 1-Tap End-of-Day Backup */}
          <View style={[styles.row, styles.rowFirst, { backgroundColor: "#FFF7ED" }]}>
            <View style={[styles.rowIcon, { backgroundColor: "#FFEDD5" }]}>
              <Feather name="moon" size={16} color={colors.primary} />
            </View>
            <View style={[styles.rowContent, { paddingRight: 8 }]}>
              <Text style={[styles.rowLabel, { fontFamily: "Inter_700Bold", color: "#9A3412" }]}>
                1-Tap End-of-Day Backup
              </Text>
              <Text style={[styles.rowValue, { color: "#C2410C", fontSize: 11 }]}>
                {backupEmail
                  ? `Saves today's register to Drive or ${backupEmail}`
                  : "Saves today's register to Google Drive / Email"}
              </Text>
            </View>
            <Pressable style={styles.saveBtn} onPress={handleExport}>
              <Text style={styles.saveBtnText}>Backup</Text>
            </Pressable>
          </View>

          {/* Backup Reminders */}
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name="bell" size={16} color={colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{t.backupReminders}</Text>
              <Text style={styles.rowValue}>
                {frequency === "off"
                  ? t.backupFrequencyOff
                  : frequency === "daily"
                    ? "Daily (9:00 PM Closing Time)"
                    : frequency === "weekly"
                      ? "Weekly (Sunday 9:00 PM)"
                      : "Monthly (1st of month)"}
              </Text>
            </View>
            <Pressable
              style={styles.saveBtn}
              onPress={() => {
                const next =
                  frequency === "off"
                    ? "daily"
                    : frequency === "daily"
                      ? "weekly"
                      : frequency === "weekly"
                        ? "monthly"
                        : "off";
                setFrequency(next);
              }}
            >
              <Text style={styles.saveBtnText}>Change</Text>
            </Pressable>
          </View>

          {/* Export Backup */}
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name="upload-cloud" size={16} color={colors.primary} />
            </View>
            <View style={[styles.rowContent, { paddingRight: 8 }]}>
              <Text style={styles.rowLabel}>Export Full Backup</Text>
              <Text style={[styles.rowValue, { color: colors.primary, fontSize: 11 }]}>
                Includes catalog, sales history & store profile
              </Text>
            </View>
            <Pressable style={styles.saveBtn} onPress={handleExport}>
              <Text style={styles.saveBtnText}>Export</Text>
            </Pressable>
          </View>

          {/* Restore Data */}
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name="download-cloud" size={16} color={colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Restore from Backup</Text>
              <Text style={styles.rowValue}>Load and verify a .json backup file</Text>
            </View>
            <Pressable
              style={[styles.saveBtn, { backgroundColor: colors.mutedForeground }]}
              onPress={handleImport}
            >
              <Text style={styles.saveBtnText}>Import</Text>
            </Pressable>
          </View>
        </View>

        {/* About & Play Store Compliance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About & Support</Text>

          {/* Privacy Policy Link (Mandated by Google Play) */}
          <Pressable onPress={handleOpenPrivacyPolicy}>
            <View style={[styles.row, styles.rowFirst]}>
              <View style={styles.rowIcon}>
                <Feather name="file-text" size={16} color={colors.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Privacy Policy</Text>
                <Text style={styles.rowValue}>Read data privacy and security terms</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>
          </Pressable>

          {/* Terms of Service */}
          <Pressable onPress={handleOpenTerms}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Feather name="check-square" size={16} color={colors.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Terms of Service</Text>
                <Text style={styles.rowValue}>Software usage guidelines</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>
          </Pressable>

          {/* Share App */}
          <Pressable onPress={handleShareApp}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Feather name="share-2" size={16} color={colors.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Share SaleSync App</Text>
                <Text style={styles.rowValue}>Recommend to other shop owners</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>
          </Pressable>

          {/* Rate Us on Google Play */}
          <Pressable onPress={handleRateApp}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Feather name="star" size={16} color="#EAB308" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Rate on Google Play</Text>
                <Text style={styles.rowValue}>Leave a review or 5-star rating</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>
          </Pressable>

          {/* Help & Support */}
          <Pressable onPress={handleContactSupport}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Feather name="help-circle" size={16} color={colors.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Feedback & Support</Text>
                <Text style={styles.rowValue}>support@salesync.app</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Pressable onPress={() => setShowDangerZone(!showDangerZone)}>
            <View
              style={[
                styles.row,
                styles.rowFirst,
                { borderBottomWidth: showDangerZone ? 1 : 0 },
              ]}
            >
              <View style={[styles.rowIcon, { backgroundColor: "#FEE2E2" }]}>
                <Feather name="alert-triangle" size={16} color={colors.destructive} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: colors.destructive }]}>
                  Danger Zone
                </Text>
                <Text style={styles.rowValue}>Erase local data & register</Text>
              </View>
              <Feather
                name={showDangerZone ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.mutedForeground}
              />
            </View>
          </Pressable>

          {showDangerZone && (
            <>
              {/* Reset Active Store Only */}
              <View style={[styles.row, { borderBottomWidth: 1, paddingLeft: 66 }]}>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>Reset "{shopName || "Store"}"</Text>
                  <Text style={styles.rowValue}>Erase only this store's items & sales</Text>
                </View>
                <Pressable
                  style={[styles.saveBtn, { backgroundColor: "#EA580C" }]}
                  onPress={handleResetActiveStore}
                >
                  <Text style={styles.saveBtnText}>Reset Store</Text>
                </Pressable>
              </View>

              {/* Delete Active Store Profile if multiple exist */}
              {stores.length > 1 && (
                <View style={[styles.row, { borderBottomWidth: 1, paddingLeft: 66 }]}>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowLabel, { color: colors.destructive }]}>
                      Delete "{shopName || "Store"}" Profile
                    </Text>
                    <Text style={styles.rowValue}>Removes this store entirely</Text>
                  </View>
                  <Pressable
                    style={[styles.saveBtn, { backgroundColor: colors.destructive }]}
                    onPress={handleDeleteActiveStore}
                  >
                    <Text style={styles.saveBtnText}>Delete</Text>
                  </Pressable>
                </View>
              )}

              {/* Reset Complete App */}
              <View style={[styles.row, { borderBottomWidth: 0, paddingLeft: 66 }]}>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>Reset Complete App</Text>
                  <Text style={styles.rowValue}>Permanently delete all stores & data</Text>
                </View>
                <Pressable
                  style={[styles.saveBtn, { backgroundColor: colors.destructive }]}
                  onPress={handleReset}
                >
                  <Text style={styles.saveBtnText}>Reset All</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

        {/* App Version Info Footer */}
        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>SaleSync v1.0.0 (Build 1)</Text>
          <Text style={styles.versionSubtext}>Made for Indian Dukaans & Retailers</Text>
        </View>

        <View style={styles.listBottom} />
      </ScrollView>

      {/* Offline In-App Privacy Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <Pressable onPress={() => setShowPrivacyModal(false)}>
                <Feather name="x" size={22} color={colors.foreground} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.policyHeading}>1. Zero Data Collection</Text>
              <Text style={styles.policyText}>
                SaleSync is designed with a strict offline-first architecture. All transaction
                records, customer names, inventory items, and receipts are stored locally on
                your device using encrypted private storage.
              </Text>

              <Text style={styles.policyHeading}>2. Barcode Lookups</Text>
              <Text style={styles.policyText}>
                When you scan product barcodes, SaleSync queries the public Open Food Facts
                database over an encrypted HTTPS connection solely to retrieve the product name
                and details. No user identifiers or shop locations are transmitted.
              </Text>

              <Text style={styles.policyHeading}>3. Biometric Security</Text>
              <Text style={styles.policyText}>
                When App Lock is enabled, authentication is handled natively by your Android
                Operating System via BiometricPrompt. SaleSync never accesses or stores your
                fingerprint, face, or PIN data.
              </Text>

              <Text style={styles.policyHeading}>4. Backups and Export</Text>
              <Text style={styles.policyText}>
                Backups generated by SaleSync are controlled exclusively by you and saved to your
                chosen destination (such as Google Drive or device files).
              </Text>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Business Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Shop Category</Text>
              <Pressable onPress={() => setShowCategoryModal(false)}>
                <Feather name="x" size={22} color={colors.foreground} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {BUSINESS_TYPES.map((bt) => {
                const isSelected = businessType === bt.type;
                const label =
                  language === "hi" ? bt.hi : language === "mr" ? bt.mr : bt.en;
                return (
                  <Pressable
                    key={bt.type}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderRadius: colors.radius,
                      backgroundColor: isSelected ? "#FFF7ED" : colors.card,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.border,
                      marginBottom: 10,
                      gap: 14,
                    }}
                    onPress={async () => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      await setBusinessType(bt.type);
                      setShowCategoryModal(false);

                      const suggested = SUGGESTED_ITEMS[bt.type];
                      if (suggested && suggested.length > 0) {
                        Alert.alert(
                          language === "hi" ? "दुकान बदली गई" : language === "mr" ? "व्यवसाय बदलला" : "Shop Category Updated",
                          `${label}: ${t.starterItemsPrompt}`,
                          [
                            {
                              text: language === "hi" ? "नहीं, रहने दें" : language === "mr" ? "नको" : "No, Keep Current",
                              style: "cancel",
                            },
                            {
                              text: language === "hi" ? "सामान जोड़ें" : language === "mr" ? "वस्तू जोडा" : "Add Starter Items",
                              onPress: () => handleLoadStarterCatalog(bt.type),
                            },
                          ]
                        );
                      }
                    }}
                  >
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        backgroundColor: isSelected ? colors.primary : colors.muted,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather
                        name={bt.icon as any}
                        size={18}
                        color={isSelected ? "#FFFFFF" : colors.foreground}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontFamily: "Inter_600SemiBold",
                          color: isSelected ? colors.primary : colors.foreground,
                        }}
                      >
                        {label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Inter_400Regular",
                          color: colors.mutedForeground,
                          marginTop: 2,
                        }}
                      >
                        {bt.en}
                      </Text>
                    </View>
                    {isSelected && (
                      <Feather name="check" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                );
              })}
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Store Switcher Modal */}
      <StoreSwitcherModal
        visible={showStoreSwitcher}
        onClose={() => setShowStoreSwitcher(false)}
      />
    </View>
  );
}
