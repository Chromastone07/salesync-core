import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { LANGUAGES, type Language } from "@/constants/translations";

export default function LanguageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setLanguage } = useApp();
  const [selected, setSelected] = useState<Language | null>(null);

  const handleSelect = async (lang: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(lang);
  };

  const handleContinue = async () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setLanguage(selected);
    router.push("/onboarding/business");
  };

  const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 40),
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24),
    },
    header: { marginBottom: 48 },
    logoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 24,
    },
    logoIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    appName: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      letterSpacing: -0.5,
    },
    tagline: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.7)",
      marginTop: 2,
    },
    title: {
      fontSize: 32,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      lineHeight: 40,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.75)",
      marginTop: 8,
    },
    langList: { flex: 1, gap: 12 },
    langCard: {
      backgroundColor: "rgba(255,255,255,0.12)",
      borderRadius: colors.radius,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 2,
      borderColor: "transparent",
    },
    langCardSelected: {
      backgroundColor: "rgba(255,255,255,0.22)",
      borderColor: "#FFFFFF",
    },
    langNative: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    langEnglish: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.7)",
      marginTop: 2,
    },
    checkCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },
    emptyCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.5)",
    },
    continueBtn: {
      backgroundColor: "#FFFFFF",
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 24,
      opacity: selected ? 1 : 0.5,
    },
    continueBtnText: {
      fontSize: 17,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#EA6C00", "#F97316", "#FB923C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Feather name="shopping-bag" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.appName}>SaleSync</Text>
                <Text style={styles.tagline}>Digital Register</Text>
              </View>
            </View>
            <Text style={styles.title}>Select{"\n"}Language</Text>
            <Text style={styles.subtitle}>Choose your preferred language</Text>
          </View>

          <View style={styles.langList}>
            {LANGUAGES.map((lang) => {
              const isSelected = selected === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => handleSelect(lang.code)}
                  style={[styles.langCard, isSelected && styles.langCardSelected]}
                >
                  <View>
                    <Text style={styles.langNative}>{lang.native}</Text>
                    {lang.native !== lang.label && (
                      <Text style={styles.langEnglish}>{lang.label}</Text>
                    )}
                  </View>
                  {isSelected ? (
                    <View style={styles.checkCircle}>
                      <Feather name="check" size={16} color={colors.primary} />
                    </View>
                  ) : (
                    <View style={styles.emptyCircle} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.continueBtn}
            onPress={handleContinue}
            disabled={!selected}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}
