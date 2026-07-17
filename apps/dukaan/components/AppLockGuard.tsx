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
        <Feather name="lock" color="#10b981" size={64} style={styles.icon} />
        <Text style={styles.title}>App Locked</Text>
        <Text style={styles.subtitle}>Unlock with your fingerprint or PIN</Text>
        <Pressable style={styles.button} onPress={authenticate}>
          <Text style={styles.buttonText}>Unlock</Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  }
});
