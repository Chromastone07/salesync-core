import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { reloadAppAsync } from "expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleRestart = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await reloadAppAsync();
    } catch (restartError) {
      console.error("Failed to restart app via reloadAppAsync:", restartError);
      resetError();
    }
  };

  const handleSafeReset = () => {
    Alert.alert(
      "Safe Storage Reset",
      "This will clear temporary app caches and reset navigation. Your store inventory and sales will NOT be deleted. Do you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Safe Reset",
          style: "destructive",
          onPress: async () => {
            try {
              // Only remove transient navigation / lock keys if needed
              await AsyncStorage.removeItem("app_active_store_id");
              await reloadAppAsync();
            } catch (e) {
              resetError();
            }
          },
        },
      ]
    );
  };

  const monoFont = Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.card}>
        {/* Safe Storage Reassurance Badge */}
        <View style={styles.shieldBadge}>
          <Feather name="shield" size={14} color="#059669" />
          <Text style={styles.shieldText}>Local Offline Data Safe</Text>
        </View>

        {/* Circular Warning Icon */}
        <View style={styles.iconCircle}>
          <Feather name="alert-circle" size={36} color="#DC2626" />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Temporary Glitch Detected
        </Text>

        <Text style={[styles.message, { color: colors.mutedForeground }]}>
          SaleSync paused to protect your records. Don't worry — your offline inventory,
          sales history, and customer dues are completely safe on this device.
        </Text>

        {/* Primary Action: Restart */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={handleRestart}
        >
          <Feather name="refresh-cw" size={18} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Restart SaleSync</Text>
        </Pressable>

        {/* Secondary Action: Try Screen Reload */}
        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            resetError();
          }}
        >
          <Feather name="arrow-left" size={16} color={colors.foreground} />
          <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>
            Try Screen Again
          </Text>
        </Pressable>

        {/* Bottom utility links */}
        <View style={styles.footerLinks}>
          <Pressable
            style={styles.textLink}
            onPress={() => setShowDiagnostics((prev) => !prev)}
          >
            <Feather
              name={showDiagnostics ? "chevron-up" : "info"}
              size={13}
              color={colors.mutedForeground}
            />
            <Text style={[styles.textLinkText, { color: colors.mutedForeground }]}>
              {showDiagnostics ? "Hide Error Diagnostics" : "Diagnostic Information"}
            </Text>
          </Pressable>

          <Pressable style={styles.textLink} onPress={handleSafeReset}>
            <Feather name="tool" size={13} color="#D97706" />
            <Text style={[styles.textLinkText, { color: "#D97706" }]}>
              Emergency Safe Reset
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Diagnostics Drawer Modal */}
      <Modal
        visible={showDiagnostics}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDiagnostics(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.background,
                paddingBottom: insets.bottom + 16,
              },
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                  Technical Diagnostics
                </Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                  Share this with support if the issue persists
                </Text>
              </View>
              <Pressable
                onPress={() => setShowDiagnostics(false)}
                style={styles.closeBtn}
                hitSlop={12}
              >
                <Feather name="x" size={22} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView style={styles.diagScroll}>
              <View style={[styles.diagBox, { backgroundColor: colors.muted }]}>
                <Text
                  style={[
                    styles.diagText,
                    { color: colors.foreground, fontFamily: monoFont },
                  ]}
                  selectable
                >
                  {`Error: ${error.message}\n\nStack:\n${error.stack || "No stack trace available"}`}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    padding: 24,
  },
  shieldBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
  },
  shieldText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#059669",
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
    maxWidth: 320,
  },
  primaryBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  secondaryBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  footerLinks: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  textLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  textLinkText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    width: "100%",
    maxHeight: "80%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  diagScroll: {
    padding: 16,
  },
  diagBox: {
    padding: 12,
    borderRadius: 10,
  },
  diagText: {
    fontSize: 11,
    lineHeight: 16,
  },
});
