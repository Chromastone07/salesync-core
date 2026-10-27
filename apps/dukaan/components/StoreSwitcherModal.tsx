import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  BUSINESS_TYPES,
  type BusinessType,
  translations,
} from "@/constants/translations";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function StoreSwitcherModal({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    stores,
    activeStoreId,
    switchStore,
    createStore,
    deleteStore,
    language,
  } = useApp();
  const t = translations[language];

  const [isCreating, setIsCreating] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<BusinessType>("kirana");
  const [newStorePhone, setNewStorePhone] = useState("");
  const [newStoreUpi, setNewStoreUpi] = useState("");
  const [preloadStarter, setPreloadStarter] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetCreateForm = () => {
    setIsCreating(false);
    setNewStoreName("");
    setSelectedCategory("kirana");
    setNewStorePhone("");
    setNewStoreUpi("");
    setPreloadStarter(true);
  };

  const handleSelectStore = async (storeId: string) => {
    if (storeId === activeStoreId) {
      onClose();
      return;
    }
    Haptics.selectionAsync();
    await switchStore(storeId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  const handleCreateStore = async () => {
    const trimmedName = newStoreName.trim();
    if (!trimmedName) {
      Alert.alert("Store Name Required", "Please enter a name for your new shop profile.");
      return;
    }

    setIsSubmitting(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await createStore(
        {
          name: trimmedName,
          businessType: selectedCategory,
          phone: newStorePhone.trim(),
          upi: newStoreUpi.trim(),
        },
        preloadStarter
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetCreateForm();
      onClose();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not create store profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStore = (storeId: string, storeName: string) => {
    if (stores.length <= 1) {
      Alert.alert("Cannot Delete", t.cannotDeleteOnlyStore);
      return;
    }

    Alert.alert(
      t.deleteStore,
      `${t.deleteStoreConfirm}\n\n"${storeName}"\n\nAll items and sales for this store will be permanently deleted. Other stores will remain completely safe.`,
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.delete,
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await deleteStore(storeId);
            } catch (e: any) {
              Alert.alert("Error", e?.message || "Could not delete store.");
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "90%",
      paddingTop: 12,
      paddingHorizontal: 20,
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20),
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 16,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    subtitle: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    storeList: {
      marginBottom: 16,
    },
    storeCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderRadius: colors.radius,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      marginBottom: 10,
    },
    storeCardActive: {
      borderColor: colors.primary,
      backgroundColor: "#FFF7ED",
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    iconBoxActive: {
      backgroundColor: colors.primary,
    },
    storeInfo: {
      flex: 1,
    },
    storeName: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    storeCategory: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    activeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    activeBadgeText: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    trashBtn: {
      padding: 8,
      marginLeft: 4,
    },
    addStoreBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderStyle: "dashed",
      borderRadius: colors.radius,
      paddingVertical: 14,
      marginBottom: 8,
    },
    addStoreBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    // Creation Form
    formContainer: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    formTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 12,
    },
    inputLabel: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      marginBottom: 14,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 14,
    },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryChipText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    categoryChipTextActive: {
      color: "#FFFFFF",
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
      marginBottom: 16,
    },
    switchText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      flex: 1,
      paddingRight: 10,
    },
    formBtnRow: {
      flexDirection: "row",
      gap: 10,
    },
    cancelBtn: {
      flex: 1,
      backgroundColor: colors.muted,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
    },
    cancelBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    submitBtn: {
      flex: 2,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
    },
    submitBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%" }}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>{t.stores}</Text>
                <Text style={styles.subtitle}>
                  Switch or manage your business profiles
                </Text>
              </View>
              <Pressable style={styles.closeBtn} onPress={onClose}>
                <Feather name="x" size={18} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Store List */}
              <View style={styles.storeList}>
                {stores.map((store) => {
                  const isActive = store.id === activeStoreId;
                  const cat = BUSINESS_TYPES.find((b) => b.type === store.businessType);
                  const catName =
                    language === "hi"
                      ? cat?.hi
                      : language === "mr"
                        ? cat?.mr
                        : cat?.en;

                  return (
                    <Pressable
                      key={store.id}
                      style={[styles.storeCard, isActive && styles.storeCardActive]}
                      onPress={() => handleSelectStore(store.id)}
                    >
                      <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                        <Feather
                          name={(cat?.icon as any) || "briefcase"}
                          size={20}
                          color={isActive ? "#FFFFFF" : colors.primary}
                        />
                      </View>
                      <View style={styles.storeInfo}>
                        <Text style={styles.storeName}>{store.name || "My Store"}</Text>
                        <Text style={styles.storeCategory}>
                          {catName || "Kirana"} {store.phone ? `· ${store.phone}` : ""}
                        </Text>
                      </View>

                      {isActive ? (
                        <View style={styles.activeBadge}>
                          <Feather name="check" size={12} color="#FFFFFF" />
                          <Text style={styles.activeBadgeText}>{t.activeStore}</Text>
                        </View>
                      ) : (
                        stores.length > 1 && (
                          <Pressable
                            style={styles.trashBtn}
                            onPress={() => handleDeleteStore(store.id, store.name || "Store")}
                          >
                            <Feather name="trash-2" size={16} color={colors.destructive} />
                          </Pressable>
                        )
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* Add Store Form or Toggle */}
              {isCreating ? (
                <View style={styles.formContainer}>
                  <Text style={styles.formTitle}>Add New Shop Profile</Text>

                  <Text style={styles.inputLabel}>Shop Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Gupta Atta Chakki or City Dairy"
                    placeholderTextColor={colors.mutedForeground}
                    value={newStoreName}
                    onChangeText={setNewStoreName}
                    autoFocus
                  />

                  <Text style={styles.inputLabel}>Business Category</Text>
                  <View style={styles.categoryGrid}>
                    {BUSINESS_TYPES.map((bt) => {
                      const isSelected = selectedCategory === bt.type;
                      const label =
                        language === "hi"
                          ? bt.hi
                          : language === "mr"
                            ? bt.mr
                            : bt.en;
                      return (
                        <Pressable
                          key={bt.type}
                          style={[
                            styles.categoryChip,
                            isSelected && styles.categoryChipActive,
                          ]}
                          onPress={() => setSelectedCategory(bt.type)}
                        >
                          <Feather
                            name={bt.icon as any}
                            size={14}
                            color={isSelected ? "#FFFFFF" : colors.foreground}
                          />
                          <Text
                            style={[
                              styles.categoryChipText,
                              isSelected && styles.categoryChipTextActive,
                            ]}
                          >
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Text style={styles.inputLabel}>Contact Phone (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. +91 98765 43210"
                    placeholderTextColor={colors.mutedForeground}
                    value={newStorePhone}
                    onChangeText={setNewStorePhone}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.inputLabel}>UPI ID (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. shop@upi"
                    placeholderTextColor={colors.mutedForeground}
                    value={newStoreUpi}
                    onChangeText={setNewStoreUpi}
                    autoCapitalize="none"
                  />

                  <View style={styles.switchRow}>
                    <Text style={styles.switchText}>{t.preloadStarter}</Text>
                    <Switch
                      value={preloadStarter}
                      onValueChange={setPreloadStarter}
                      trackColor={{ false: colors.muted, true: colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  <View style={styles.formBtnRow}>
                    <Pressable
                      style={styles.cancelBtn}
                      onPress={resetCreateForm}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.cancelBtnText}>{t.cancel}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.submitBtn}
                      onPress={handleCreateStore}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.submitBtnText}>
                        {isSubmitting ? "Creating..." : t.createStore}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  style={styles.addStoreBtn}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setIsCreating(true);
                  }}
                >
                  <Feather name="plus-circle" size={18} color={colors.primary} />
                  <Text style={styles.addStoreBtnText}>{t.addNewStore}</Text>
                </Pressable>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
