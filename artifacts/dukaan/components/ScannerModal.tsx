import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

type Props = {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
};

export function ScannerModal({ visible, onClose, onScan }: Props) {
  const colors = useColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!visible) return null;

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
    // Reset scanner after 2 seconds to allow scanning another item if they didn't close
    setTimeout(() => setScanned(false), 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <View style={[s.header, { borderBottomColor: colors.border }]}>
          <Text style={[s.title, { color: colors.foreground }]}>Scan Barcode</Text>
          <Pressable onPress={onClose} style={s.closeBtn}>
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
        </View>

        {!permission ? (
          <View style={s.center}>
            <Text style={{ color: colors.mutedForeground }}>Requesting camera permission...</Text>
          </View>
        ) : !permission.granted ? (
          <View style={s.center}>
            <Text style={[s.text, { color: colors.foreground }]}>We need your permission to use the camera</Text>
            <Pressable style={[s.btn, { backgroundColor: colors.primary }]} onPress={requestPermission}>
              <Text style={s.btnText}>Grant Permission</Text>
            </Pressable>
          </View>
        ) : (
          <View style={s.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              barcodeScannerSettings={{
                barcodeTypes: ["ean13", "ean8", "upc_e", "upc_a", "qr"],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />
            <View style={s.overlay}>
              <View style={s.scanFrame} />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  closeBtn: { padding: 4 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  text: { fontSize: 16, textAlign: "center", marginBottom: 20, fontFamily: "Inter_400Regular" },
  btn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 16 },
  cameraContainer: { flex: 1, position: "relative" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
    borderRadius: 8,
  },
});
