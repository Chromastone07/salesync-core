import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
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
  SUGGESTED_ITEMS,
  translations,
  type SuggestedItem,
} from "@/constants/translations";

type ItemState = SuggestedItem & { selected: boolean; customRate: string };

export default function QuickStartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language, businessType, completeOnboarding } = useApp();
  const { addInventoryItem } = useStore();
  const t = translations[language];

  const suggested = SUGGESTED_ITEMS[businessType] ?? SUGGESTED_ITEMS.other;
  const [items, setItems] = useState<ItemState[]>(
    suggested.map((s) => ({ ...s, selected: true, customRate: s.rate.toString() }))
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggleItem = (idx: number) => {
    Haptics.selectionAsync();
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, selected: !it.selected } : it))
    );
  };

  const updateRate = (idx: number, val: string) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, customRate: val } : it))
    );
  };

  const handleStart = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(true);
    try {
      const selectedItems = items.filter((i) => i.selected);
      for (const item of selectedItems) {
        const label =
          language === "hi" ? item.hi : language === "mr" ? item.mr : item.en;
        await addInventoryItem({
          label: item.en,
          localLabel: label,
          unit: item.unit,
          rate: parseFloat(item.customRate) || item.rate,
          isService: item.isService,
        });
      }
      await completeOnboarding();
      router.replace("/(tabs)");
    } finally {
      setIsSaving(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    content: {
      paddingHorizontal: 20,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 32),
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) + 80,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    title: {
      fontSize: 30,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    subtitle: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.75)",
      marginTop: 6,
      marginBottom: 24,
    },
    itemCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.12)",
      borderRadius: colors.radius,
      padding: 16,
      marginBottom: 10,
      borderWidth: 2,
      borderColor: "transparent",
    },
    itemCardSelected: {
      backgroundColor: "rgba(255,255,255,0.2)",
      borderColor: "rgba(255,255,255,0.5)",
    },
    checkBox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.6)",
      marginRight: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    checkBoxSelected: {
      backgroundColor: "#FFFFFF",
      borderColor: "#FFFFFF",
    },
    itemInfo: { flex: 1 },
    itemName: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    itemUnit: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.65)",
      marginTop: 2,
    },
    serviceTag: {
      fontSize: 10,
      fontFamily: "Inter_500Medium",
      color: "rgba(255,255,255,0.8)",
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      overflow: "hidden",
      alignSelf: "flex-start",
      marginTop: 4,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      minWidth: 80,
    },
    rupee: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
      marginRight: 2,
    },
    priceInput: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
      minWidth: 50,
      textAlign: "right",
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16),
    },
    startBtn: {
      backgroundColor: "#FFFFFF",
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
    },
    startBtnText: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: "#0EA5E9",
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0EA5E9", "#38BDF8", "#7DD3FC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </Pressable>

            <Text style={styles.title}>{t.quickStart}</Text>
            <Text style={styles.subtitle}>{t.quickStartDesc}</Text>

            {items.map((item, idx) => {
              const name =
                language === "hi"
                  ? item.hi
                  : language === "mr"
                    ? item.mr
                    : item.en;
              const isSelected = item.selected;
              return (
                <Pressable
                  key={idx}
                  style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                  onPress={() => toggleItem(idx)}
                >
                  <View
                    style={[styles.checkBox, isSelected && styles.checkBoxSelected]}
                  >
                    {isSelected && (
                      <Feather name="check" size={14} color="#0EA5E9" />
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{name}</Text>
                    <Text style={styles.itemUnit}>{item.unit}</Text>
                    {item.isService && (
                      <Text style={styles.serviceTag}>Service</Text>
                    )}
                  </View>
                  {isSelected && (
                    <Pressable
                      style={styles.priceRow}
                      onPress={(e) => e.stopPropagation?.()}
                    >
                      <Text style={styles.rupee}>₹</Text>
                      <TextInput
                        style={styles.priceInput}
                        value={item.customRate}
                        onChangeText={(v) => updateRate(idx, v)}
                        keyboardType="numeric"
                        selectTextOnFocus
                        placeholderTextColor="rgba(255,255,255,0.5)"
                      />
                    </Pressable>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.startBtn} onPress={handleStart} disabled={isSaving}>
              <Text style={styles.startBtnText}>{t.startApp}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}
