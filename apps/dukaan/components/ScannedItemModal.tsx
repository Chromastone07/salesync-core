import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { translations } from "@/constants/translations";
import { useApp } from "@/context/AppContext";

type ScannedItemModalProps = {
  visible: boolean;
  itemLabel: string;
  quantity: number;
  onClose: () => void;
  onCancel: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function ScannedItemModal({
  visible,
  itemLabel,
  quantity,
  onClose,
  onCancel,
  onIncrement,
  onDecrement,
}: ScannedItemModalProps) {
  const colors = useColors();
  const { language } = useApp();
  const t = translations[language];

  if (!visible) return null;

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[styles.dialog, { backgroundColor: colors.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <View style={[styles.iconBox, { backgroundColor: colors.muted }]}>
              <Feather name="check-circle" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {itemLabel}
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Item added to cart!
            </Text>
          </View>

          <View style={styles.qtyRow}>
            <Pressable
              style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
              onPress={onDecrement}
            >
              <Feather name="minus" size={20} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.qtyNum, { color: colors.foreground }]}>
              {quantity}
            </Text>
            <Pressable
              style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
              onPress={onIncrement}
            >
              <Feather name="plus" size={20} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.doneBtn, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  dialog: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    marginBottom: 32,
  },
  qtyBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyNum: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    minWidth: 40,
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  doneBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  doneText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
