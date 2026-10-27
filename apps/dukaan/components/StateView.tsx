import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

/* -------------------------------------------------------------------------- */
/*                               LOADING SPINNER                              */
/* -------------------------------------------------------------------------- */

export type LoadingSpinnerProps = {
  message?: string;
  size?: "small" | "large";
  fullscreen?: boolean;
};

export function LoadingSpinner({
  message = "Loading...",
  size = "large",
  fullscreen = false,
}: LoadingSpinnerProps) {
  const colors = useColors();
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle breathing pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Continuous spin animation
    const spin = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulse.start();
    spin.start();

    return () => {
      pulse.stop();
      spin.stop();
    };
  }, [pulseAnim, rotateAnim]);

  const spinInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      ...(fullscreen
        ? {
            flex: 1,
            backgroundColor: colors.background,
          }
        : {}),
    },
    spinnerWrapper: {
      width: size === "large" ? 64 : 44,
      height: size === "large" ? 64 : 44,
      borderRadius: size === "large" ? 32 : 22,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    message: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      textAlign: "center",
    },
    subtext: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 4,
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinnerWrapper,
          {
            opacity: pulseAnim,
            transform: [{ rotate: spinInterpolation }],
          },
        ]}
      >
        <Feather name="loader" size={size === "large" ? 28 : 20} color={colors.primary} />
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subtext}>Please wait a moment</Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 EMPTY STATE                                */
/* -------------------------------------------------------------------------- */

export type EmptyStateProps = {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  icon = "inbox",
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
}: EmptyStateProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      padding: 36,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 18,
      maxWidth: 280,
      marginBottom: actionLabel ? 20 : 0,
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: colors.radius,
      marginBottom: secondaryActionLabel ? 10 : 0,
    },
    actionText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    secondaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: colors.radius,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Feather name={icon} size={30} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {actionLabel && onAction ? (
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAction();
          }}
        >
          <Feather name="plus-circle" size={16} color="#FFFFFF" />
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}

      {secondaryActionLabel && onSecondaryAction ? (
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => {
            Haptics.selectionAsync();
            onSecondaryAction();
          }}
        >
          <Text style={styles.secondaryText}>{secondaryActionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 ERROR STATE                                */
/* -------------------------------------------------------------------------- */

export type ErrorStateProps = {
  title?: string;
  message?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Your store data is safe on this device.",
  error,
  onRetry,
  style,
}: ErrorStateProps) {
  const colors = useColors();
  const [showDetails, setShowDetails] = useState(false);

  const errorString =
    typeof error === "string" ? error : error instanceof Error ? error.message : null;

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
    },
    iconCircle: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: "#FEE2E2",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#FECACA",
    },
    title: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 6,
    },
    message: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 18,
      maxWidth: 290,
      marginBottom: 20,
    },
    retryBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 22,
      paddingVertical: 12,
      borderRadius: colors.radius,
      marginBottom: errorString ? 12 : 0,
    },
    retryText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    detailsToggle: {
      paddingVertical: 6,
    },
    detailsToggleText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      textDecorationLine: "underline",
    },
    detailsBox: {
      backgroundColor: colors.muted,
      borderRadius: 8,
      padding: 10,
      marginTop: 8,
      width: "100%",
    },
    detailsText: {
      fontSize: 11,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      color: colors.mutedForeground,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Feather name="alert-triangle" size={28} color={colors.destructive} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onRetry ? (
        <Pressable
          style={styles.retryBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onRetry();
          }}
        >
          <Feather name="refresh-cw" size={16} color="#FFFFFF" />
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      ) : null}

      {errorString ? (
        <View style={{ alignItems: "center", width: "100%" }}>
          <Pressable
            style={styles.detailsToggle}
            onPress={() => setShowDetails((prev) => !prev)}
          >
            <Text style={styles.detailsToggleText}>
              {showDetails ? "Hide Details" : "View Details"}
            </Text>
          </Pressable>
          {showDetails ? (
            <View style={styles.detailsBox}>
              <Text style={styles.detailsText}>{errorString}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                            STATE VIEW (CONTAINER)                          */
/* -------------------------------------------------------------------------- */

export type StateViewProps = {
  isLoading?: boolean;
  loadingMessage?: string;
  error?: Error | string | null;
  errorMessage?: string;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyIcon?: keyof typeof Feather.glyphMap;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  emptySecondaryActionLabel?: string;
  onEmptySecondaryAction?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function StateView({
  isLoading = false,
  loadingMessage = "Loading...",
  error,
  errorMessage,
  onRetry,
  isEmpty = false,
  emptyIcon = "inbox",
  emptyTitle = "No records yet",
  emptySubtitle,
  emptyActionLabel,
  onEmptyAction,
  emptySecondaryActionLabel,
  onEmptySecondaryAction,
  children,
  style,
}: StateViewProps) {
  if (isLoading) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        message={errorMessage}
        onRetry={onRetry}
        style={style}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        subtitle={emptySubtitle}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        secondaryActionLabel={emptySecondaryActionLabel}
        onSecondaryAction={onEmptySecondaryAction}
        style={style}
      />
    );
  }

  return <>{children}</>;
}
