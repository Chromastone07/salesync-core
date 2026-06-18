import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { useColors } from "@/hooks/useColors";
import {
  BUSINESS_TYPES,
  type BusinessType,
  translations,
} from "@/constants/translations";

export default function BusinessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language, setBusinessType } = useApp();
  const t = translations[language];
  const [selected, setSelected] = useState<BusinessType | null>(null);

  const handleSelect = (bt: BusinessType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(bt);
  };

  const handleContinue = async () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setBusinessType(selected);
    router.push("/onboarding/quickstart");
  };

  const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 32),
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24),
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
      lineHeight: 38,
    },
    subtitle: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.75)",
      marginTop: 8,
      marginBottom: 32,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    card: {
      width: "47%",
      backgroundColor: "rgba(255,255,255,0.12)",
      borderRadius: colors.radius,
      padding: 20,
      borderWidth: 2,
      borderColor: "transparent",
      alignItems: "flex-start",
    },
    cardSelected: {
      backgroundColor: "rgba(255,255,255,0.22)",
      borderColor: "#FFFFFF",
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    cardIconSelected: {
      backgroundColor: "#FFFFFF",
    },
    cardName: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
      lineHeight: 20,
    },
    continueBtn: {
      backgroundColor: "#FFFFFF",
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 24,
    },
    continueBtnDisabled: { opacity: 0.5 },
    continueBtnText: {
      fontSize: 17,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#7C3AED", "#A855F7", "#EC4899"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.title}>{t.whatDoYouSell}</Text>
          <Text style={styles.subtitle}>{t.selectBusiness}</Text>

          <View style={styles.grid}>
            {BUSINESS_TYPES.map((bt) => {
              const isSelected = selected === bt.type;
              const name =
                language === "hi" ? bt.hi : language === "mr" ? bt.mr : bt.en;
              return (
                <Pressable
                  key={bt.type}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => handleSelect(bt.type)}
                >
                  <View
                    style={[
                      styles.cardIcon,
                      isSelected && styles.cardIconSelected,
                    ]}
                  >
                    <Feather
                      name={bt.icon as any}
                      size={20}
                      color={isSelected ? "#7C3AED" : "#FFFFFF"}
                    />
                  </View>
                  <Text style={styles.cardName}>{name}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!selected}
          >
            <Text style={styles.continueBtnText}>{t.continue}</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
