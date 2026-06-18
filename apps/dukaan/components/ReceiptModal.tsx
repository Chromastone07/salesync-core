import { Feather } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";

import { useApp } from "@/context/AppContext";
import type { Sale } from "@/context/StoreContext";
import { useColors } from "@/hooks/useColors";

export function ReceiptModal({
  visible,
  sale,
  onClose,
}: {
  visible: boolean;
  sale: Sale | null;
  onClose: () => void;
}) {
  const colors = useColors();
  const { shopName } = useApp();
  const viewShotRef = useRef<any>(null);
  const [sharing, setSharing] = useState(false);

  if (!visible || !sale) return null;

  const handleShare = async () => {
    if (!viewShotRef.current?.capture) return;
    setSharing(true);
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri, {
        dialogTitle: "Share Receipt",
        mimeType: "image/jpeg",
        UTI: "public.jpeg",
      });
    } catch (e) {
      console.error(e);
      alert("Could not share receipt.");
    } finally {
      setSharing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    dialogContainer: {
      width: "100%",
      maxWidth: 400,
      backgroundColor: colors.background,
      borderRadius: 16,
      overflow: "hidden",
    },
    receiptContainer: {
      backgroundColor: "#ffffff",
      padding: 24,
      width: "100%",
    },
    header: {
      alignItems: "center",
      marginBottom: 20,
      borderBottomWidth: 1,
      borderStyle: "dashed",
      borderBottomColor: "#E2E8F0",
      paddingBottom: 16,
    },
    shopTitle: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: "#0F172A",
      textAlign: "center",
    },
    receiptLabel: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: "#64748B",
      marginTop: 4,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    badge: {
      alignSelf: "center",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 16,
    },
    badgeText: {
      fontSize: 12,
      fontFamily: "Inter_700Bold",
      color: "#fff",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    metaText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: "#475569",
    },
    itemsContainer: {
      marginBottom: 16,
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    itemNameCol: {
      flex: 1,
      paddingRight: 8,
    },
    itemNameText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: "#1E293B",
    },
    itemSubText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "#64748B",
      marginTop: 2,
    },
    itemTotalText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#1E293B",
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderStyle: "dashed",
      borderTopColor: "#E2E8F0",
      paddingTop: 16,
      marginTop: 8,
    },
    totalLabel: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: "#0F172A",
    },
    totalAmount: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: "#0F172A",
    },
    footer: {
      alignItems: "center",
      marginTop: 24,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: "#F1F5F9",
    },
    thankYouText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: "#475569",
      marginBottom: 4,
    },
    brandingText: {
      fontSize: 10,
      fontFamily: "Inter_400Regular",
      color: "#94A3B8",
    },
    actionRow: {
      flexDirection: "row",
      padding: 16,
      gap: 12,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    btn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    closeBtn: {
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    closeBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    shareBtn: {
      backgroundColor: "#25D366", // WhatsApp Green
    },
    shareBtnText: {
      fontSize: 15,
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
        <View style={styles.dialogContainer}>
          {/* The Receipt Snapshot Area */}
          <ViewShot
            ref={viewShotRef}
            options={{ format: "jpg", quality: 0.9 }}
            style={{ backgroundColor: "#ffffff" }}
          >
            <View style={styles.receiptContainer}>
              <View style={styles.header}>
                <Text style={styles.shopTitle}>
                  {shopName || "SaleSync Shop"}
                </Text>
                <Text style={styles.receiptLabel}>Cash Receipt</Text>
              </View>

              {sale.status === "unpaid" ? (
                <View style={[styles.badge, { backgroundColor: "#ef4444" }]}>
                  <Text style={styles.badgeText}>Unpaid - Pay Later</Text>
                </View>
              ) : (
                <View style={[styles.badge, { backgroundColor: "#22c55e" }]}>
                  <Text style={styles.badgeText}>Paid</Text>
                </View>
              )}

              <View style={styles.metaRow}>
                <View>
                  <Text style={styles.metaText}>{formatDate(sale.date)}</Text>
                  {sale.paidAt && (
                    <Text style={[styles.metaText, { color: "#22c55e", marginTop: 2, fontSize: 11 }]}>
                      Paid On: {formatDate(sale.paidAt)}
                    </Text>
                  )}
                </View>
                <Text style={styles.metaText}>Inv #{sale.id.slice(-6).toUpperCase()}</Text>
              </View>

              {sale.customerName && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.metaText}>Customer: {sale.customerName}</Text>
                </View>
              )}

              <View style={styles.itemsContainer}>
                {sale.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <View style={styles.itemNameCol}>
                      <Text style={styles.itemNameText}>{item.label}</Text>
                      <Text style={styles.itemSubText}>
                        {item.quantity} {item.unit} x ₹{item.rate}
                      </Text>
                    </View>
                    <Text style={styles.itemTotalText}>₹{item.total}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalAmount}>₹{sale.total}</Text>
              </View>

              <View style={styles.footer}>
                {sale.status === "unpaid" ? (
                  <Text style={[styles.thankYouText, { color: "#ef4444", textAlign: "center", paddingHorizontal: 10 }]}>
                    Please clear your pending balance at your earliest convenience. Thank you!
                  </Text>
                ) : (
                  <Text style={styles.thankYouText}>Thank you for visiting!</Text>
                )}
                <Text style={styles.brandingText}>Generated by SaleSync</Text>
              </View>
            </View>
          </ViewShot>

          {/* Action Buttons (Not part of the image) */}
          <View style={styles.actionRow}>
            <Pressable style={[styles.btn, styles.closeBtn]} onPress={onClose}>
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.shareBtn]}
              onPress={handleShare}
              disabled={sharing}
            >
              {sharing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="share-2" size={18} color="#FFFFFF" />
                  <Text style={styles.shareBtnText}>Share</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
