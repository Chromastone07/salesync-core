import React, { useEffect, useState, useRef } from "react";
import { AppState, View, StyleSheet, Text, AppStateStatus, Pressable } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useApp } from "@/context/AppContext";
import { Feather } from "@expo/vector-icons";

export function AppLockGuard({ children }: { children: React.ReactNode }) {
  const { isAppLockEnabled } = useApp();
  const [isLocked, setIsLocked] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // If the app starts up and lock is enabled, we lock it immediately.
    if (isAppLockEnabled) {
      setIsLocked(true);
      authenticate();
    }
  }, [isAppLockEnabled]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      // If going to background or inactive, and lock is enabled, lock the app.
      if (
        appState.current.match(/active/) &&
        (nextAppState === "background" || nextAppState === "inactive")
      ) {
        if (isAppLockEnabled) {
          setIsLocked(true);
        }
      }
      
      // If coming back to foreground and we are locked, trigger auth prompt automatically
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (isLocked && isAppLockEnabled) {
          authenticate();
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAppLockEnabled, isLocked]);

  const authenticate = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // If they don't have a passcode/biometric set up on their phone, we can't lock it.
        setIsLocked(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock SaleSync",
        fallbackLabel: "Use Passcode",
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsLocked(false);
      }
    } catch (e) {
      console.warn("Authentication error:", e);
    }
  };

  if (isAppLockEnabled && isLocked) {
    return (
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Feather name="shield" color="#F97316" size={48} />
        </View>
        <Text style={styles.title}>SaleSync Locked</Text>
        <Text style={styles.subtitle}>
          Use your fingerprint, face, or device PIN to continue
        </Text>
        <Pressable style={styles.button} onPress={authenticate}>
          <Feather name="unlock" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Unlock Register</Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBF5",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFF7ED",
    borderWidth: 2,
    borderColor: "#FFEDD5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  button: {
    width: "100%",
    maxWidth: 280,
    backgroundColor: "#F97316",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
