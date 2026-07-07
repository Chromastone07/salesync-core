import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ActivityIndicator, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { fetchProductNameByBarcode } from "@/utils/fmcgApi";
import { useApp } from "@/context/AppContext";
import { translations } from "@/constants/translations";

type Props = {
  visible: boolean;
  barcode: string;
  onClose: () => void;
  onQuickSale: (price: number) => void;
  onAddCatalog: (name: string, price: number, stock?: number) => void;
};

export function UnknownBarcodeModal({ visible, barcode, onClose, onQuickSale, onAddCatalog }: Props) {
  const colors = useColors();
  const { language } = useApp();
  const t = translations[language];

  const [mode, setMode] = useState<"choose" | "form">("choose");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && barcode) {
      setMode("choose");
      setName("");
      setPrice("");
      setStock("");
      setLoading(false);
    }
  }, [visible, barcode]);

  if (!visible) return null;

  const handleFetchOnline = () => {
    setMode("form");
    setLoading(true);
    fetchProductNameByBarcode(barcode)
      .then((fetchedName) => {
        if (fetchedName) {
          setName(fetchedName);
        } else {
          Alert.alert(
            "Item Not Found", 
            "We couldn't find this barcode in the online database. Please enter the details manually."
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleManual = () => {
    setMode("form");
  };

  const handleQuickSale = () => {
    const p = parseFloat(price);
    if (!isNaN(p) && p > 0) {
      onQuickSale(p);
    }
  };

  const handleAddCatalog = () => {
    const p = parseFloat(price);
    const s = parseFloat(stock);
    if (name.trim() && !isNaN(p) && p > 0) {
      onAddCatalog(name.trim(), p, isNaN(s) ? undefined : s);
    }
  };

  const isPriceValid = !isNaN(parseFloat(price)) && parseFloat(price) > 0;
  const isNameValid = name.trim().length > 0;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={[s.card, { backgroundColor: colors.background }]}>
          <View style={s.header}>
            <Text style={[s.title, { color: colors.foreground }]}>{t.barcodeNotFound ?? "New Item Scanned"}</Text>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Feather name="x" size={20} color={colors.foreground} />
            </Pressable>
          </View>

          <Text style={[s.barcodeText, { color: colors.mutedForeground }]}>Barcode: {barcode}</Text>

          {mode === "choose" ? (
            <View style={s.chooseContainer}>
              <Pressable
                style={[s.choiceBtn, { backgroundColor: colors.primary }]}
                onPress={handleFetchOnline}
              >
                <Feather name="cloud-drizzle" size={18} color="#FFF" />
                <Text style={s.choiceBtnText}>Fetch Online Details</Text>
              </Pressable>
              
              <Pressable
                style={[s.choiceBtn, s.choiceBtnOutline, { borderColor: colors.primary }]}
                onPress={handleManual}
              >
                <Feather name="edit-2" size={18} color={colors.primary} />
                <Text style={[s.choiceBtnTextOutline, { color: colors.primary }]}>Enter Manually</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {loading ? (
                <View style={s.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[s.loadingText, { color: colors.primary }]}>{t.fetchingDetails ?? "Fetching details..."}</Text>
                </View>
              ) : (
                <View style={s.form}>
                  <View style={s.inputGroup}>
                    <Text style={[s.label, { color: colors.foreground }]}>{t.itemName ?? "Item Name"}</Text>
                    <TextInput
                      style={[s.input, { borderColor: colors.border, color: colors.foreground }]}
                      placeholder={t.itemName ?? "Enter name"}
                      placeholderTextColor={colors.mutedForeground}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  <View style={s.inputGroup}>
                    <Text style={[s.label, { color: colors.foreground }]}>{t.price ?? "Price (₹)"}</Text>
                    <TextInput
                      style={[s.input, { borderColor: colors.border, color: colors.foreground }]}
                      placeholder="0"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="numeric"
                      value={price}
                      onChangeText={setPrice}
                      autoFocus={name.length > 0}
                    />
                  </View>

                  <View style={s.inputGroup}>
                    <Text style={[s.label, { color: colors.foreground }]}>Stock (Optional)</Text>
                    <TextInput
                      style={[s.input, { borderColor: colors.border, color: colors.foreground }]}
                      placeholder="e.g. 50"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="numeric"
                      value={stock}
                      onChangeText={setStock}
                    />
                  </View>

                  <View style={s.actions}>
                    <Pressable
                      style={[s.btn, s.btnOutline, { borderColor: colors.primary }, !isPriceValid && s.btnDisabled]}
                      onPress={handleQuickSale}
                      disabled={!isPriceValid}
                    >
                      <Text style={[s.btnTextOutline, { color: colors.primary }, !isPriceValid && s.btnTextDisabled]}>
                        {t.quickSaleOnly ?? "Quick Sale Only"}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[s.btn, { backgroundColor: colors.primary }, (!isPriceValid || !isNameValid) && s.btnDisabled]}
                      onPress={handleAddCatalog}
                      disabled={!isPriceValid || !isNameValid}
                    >
                      <Text style={s.btnText}>
                        {t.addToCatalog ?? "Add to Catalog"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  closeBtn: {
    padding: 4,
  },
  barcodeText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOutline: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  btnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  btnTextOutline: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnTextDisabled: {
    color: "#999",
  },
  chooseContainer: {
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  choiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  choiceBtnOutline: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  choiceBtnText: {
    color: "#FFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  choiceBtnTextOutline: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
