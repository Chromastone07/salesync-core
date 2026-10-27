import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import Constants from "expo-constants";
import { useApp } from "@/context/AppContext";

const isExpoGo = Constants.appOwnership === "expo";
let usePostHog: any = null;

if (!isExpoGo) {
  try {
    usePostHog = require("posthog-react-native").usePostHog;
  } catch (e) {
    console.warn("Failed to load posthog usePostHog", e);
  }
}

export type InventoryItem = {
  id: string;
  label: string;
  localLabel: string;
  unit: string;
  rate: number;
  isService: boolean;
  barcode?: string;
  stock?: number;
  needsNaming?: boolean;
};

export type SaleLineItem = {
  item_id: string;
  label: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
  is_service: boolean;
};

export type Sale = {
  id: string;
  date: string;
  items: SaleLineItem[];
  total: number;
  note: string;
  customerName?: string;
  customerPhone?: string;
  status?: "paid" | "unpaid";
  paidAt?: string;
};

type AddSaleOptions = {
  note?: string;
  customerName?: string;
  customerPhone?: string;
  status?: "paid" | "unpaid";
};

type StoreState = {
  inventoryItems: InventoryItem[];
  sales: Sale[];
  isLoading: boolean;
  loadError: string | null;
  reloadStoreData: () => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, "id">) => Promise<InventoryItem>;
  addInventoryItems: (items: Omit<InventoryItem, "id">[]) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<Omit<InventoryItem, "id">>) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  addSale: (items: SaleLineItem[], options?: AddSaleOptions) => Promise<Sale>;
  deleteSale: (id: string) => Promise<void>;
  getTodaySales: () => Sale[];
  getTodayTotal: () => number;
  clearStore: () => Promise<void>;
  exportData: (profileData?: any) => Promise<void>;
  importData: (
    onConfirm?: (stats: {
      itemCount: number;
      saleCount: number;
      profile?: any;
    }) => Promise<boolean>
  ) => Promise<boolean>;
  markSaleAsPaid: (id: string) => Promise<void>;
};

const StoreContext = createContext<StoreState | null>(null);

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { activeStoreId, activeStore } = useApp();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const posthog = usePostHog ? usePostHog() : null;

  const reloadStoreData = useCallback(async () => {
    if (!activeStoreId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const [inv, sal] = await Promise.all([
        AsyncStorage.getItem(`store_inventory_${activeStoreId}`),
        AsyncStorage.getItem(`store_sales_${activeStoreId}`),
      ]);
      if (inv) setInventoryItems(JSON.parse(inv) as InventoryItem[]);
      else setInventoryItems([]);

      if (sal) setSales(JSON.parse(sal) as Sale[]);
      else setSales([]);
    } catch (err: any) {
      console.error("Error loading store data:", err);
      setLoadError(err?.message || "Failed to load store data from device storage");
      setInventoryItems([]);
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeStoreId]);

  useEffect(() => {
    reloadStoreData();
  }, [reloadStoreData]);

  const saveInventory = useCallback(
    async (items: InventoryItem[]) => {
      setInventoryItems(items);
      if (activeStoreId) {
        await AsyncStorage.setItem(`store_inventory_${activeStoreId}`, JSON.stringify(items));
      }
    },
    [activeStoreId]
  );

  const saveSales = useCallback(
    async (s: Sale[]) => {
      setSales(s);
      if (activeStoreId) {
        await AsyncStorage.setItem(`store_sales_${activeStoreId}`, JSON.stringify(s));
      }
    },
    [activeStoreId]
  );

  const addInventoryItem = useCallback(
    async (item: Omit<InventoryItem, "id">) => {
      const newItem: InventoryItem = { ...item, id: genId() };
      await saveInventory([...inventoryItems, newItem]);
      return newItem;
    },
    [inventoryItems, saveInventory]
  );

  const addInventoryItems = useCallback(
    async (items: Omit<InventoryItem, "id">[]) => {
      const newItems = items.map((item) => ({ ...item, id: genId() }));
      await saveInventory([...inventoryItems, ...newItems]);
    },
    [inventoryItems, saveInventory]
  );

  const updateInventoryItem = useCallback(
    async (id: string, updates: Partial<Omit<InventoryItem, "id">>) => {
      const updated = inventoryItems.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      );
      await saveInventory(updated);
    },
    [inventoryItems, saveInventory]
  );

  const updateStock = useCallback(
    async (id: string, newStock: number) => {
      const updated = inventoryItems.map((i) =>
        i.id === id ? { ...i, stock: newStock } : i
      );
      await saveInventory(updated);
    },
    [inventoryItems, saveInventory]
  );

  const deleteInventoryItem = useCallback(
    async (id: string) => {
      await saveInventory(inventoryItems.filter((i) => i.id !== id));
    },
    [inventoryItems, saveInventory]
  );

  const addSale = useCallback(
    async (items: SaleLineItem[], options: AddSaleOptions = {}) => {
      const total = items.reduce((s, i) => s + i.total, 0);
      const sale: Sale = {
        id: genId(),
        date: new Date().toISOString(),
        items,
        total,
        note: options.note ?? "",
        customerName: options.customerName?.trim() || undefined,
        customerPhone: options.customerPhone?.trim() || undefined,
        status: options.status ?? "paid",
      };
      await saveSales([sale, ...sales]);
      
      // Decrement stock for non-service items
      const newInventory = [...inventoryItems];
      let inventoryChanged = false;
      
      for (const saleItem of items) {
        if (!saleItem.is_service) {
          const invIndex = newInventory.findIndex(i => i.id === saleItem.item_id);
          if (invIndex >= 0 && typeof newInventory[invIndex].stock === 'number') {
            newInventory[invIndex] = {
              ...newInventory[invIndex],
              stock: (newInventory[invIndex].stock || 0) - saleItem.quantity
            };
            inventoryChanged = true;
          }
        }
      }
      
      if (inventoryChanged) {
        await saveInventory(newInventory);
      }

      try {
        posthog?.capture("sale_completed", {
          total,
          itemCount: items.length,
          status: options.status ?? "paid",
        });
      } catch (e) {
        // ignore analytics error
      }
      
      return sale;
    },
    [sales, saveSales, inventoryItems, saveInventory, posthog]
  );

  const deleteSale = useCallback(
    async (id: string) => {
      await saveSales(sales.filter((s) => s.id !== id));
    },
    [sales, saveSales]
  );

  const markSaleAsPaid = useCallback(
    async (id: string) => {
      const updatedSales = sales.map((s) => {
        if (s.id === id) {
          return { ...s, status: "paid" as const, paidAt: new Date().toISOString() };
        }
        return s;
      });
      await saveSales(updatedSales);
    },
    [sales, saveSales]
  );

  const getTodaySales = useCallback(() => {
    const today = new Date().toDateString();
    return sales.filter((s) => new Date(s.date).toDateString() === today);
  }, [sales]);

  const getTodayTotal = useCallback(() => {
    return getTodaySales().reduce((sum, s) => sum + s.total, 0);
  }, [getTodaySales]);

  const clearStore = useCallback(async () => {
    if (activeStoreId) {
      await AsyncStorage.multiRemove([
        `store_inventory_${activeStoreId}`,
        `store_sales_${activeStoreId}`,
      ]);
    }
    setInventoryItems([]);
    setSales([]);
  }, [activeStoreId]);

  const exportData = useCallback(
    async (profileData?: any) => {
      try {
        const dateStr = new Date().toISOString().split("T")[0];
        const storeProfile = profileData || activeStore;
        const data = {
          version: 1,
          exportDate: new Date().toISOString(),
          storeId: activeStoreId,
          profile: storeProfile || {},
          inventoryItems,
          sales,
        };
        const jsonString = JSON.stringify(data, null, 2);
        const storeName = (storeProfile?.shopName || storeProfile?.name || "SaleSync").trim();
        const safeStoreName = storeName.replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, "_") || "Store";
        const filename = `SaleSync_${safeStoreName}_Backup_${dateStr}.json`;

        if (Platform.OS === "web") {
          const blob = new Blob([jsonString], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        }

        const FS: any = (FileSystem as any).default || FileSystem;
        const dir = FS.documentDirectory || FS.cacheDirectory;
        const fileUri = `${dir}${filename}`;

        await FS.writeAsStringAsync(fileUri, jsonString, { encoding: "utf8" });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/json",
            dialogTitle: "Export SaleSync Backup",
            UTI: "public.json",
          });
        }
      } catch (e) {
        console.error("Failed to export data", e);
        throw e;
      }
    },
    [inventoryItems, sales, activeStoreId, activeStore]
  );

  const importData = useCallback(
    async (
      onConfirm?: (stats: {
        itemCount: number;
        saleCount: number;
        profile?: any;
      }) => Promise<boolean>
    ) => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ["application/json", "text/plain", "*/*"],
          copyToCacheDirectory: true,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
          return false;
        }

        const asset = result.assets[0];
        const fileUri = asset.uri;
        let fileContent = "";

        if (Platform.OS === "web") {
          const res = await fetch(fileUri);
          fileContent = await res.text();
        } else {
          const FS: any = (FileSystem as any).default || FileSystem;
          fileContent = await FS.readAsStringAsync(fileUri, { encoding: "utf8" });
        }

        const data = JSON.parse(fileContent);

        // Resilient parsing: support inventoryItems, inventory, or items
        const rawItems = data.inventoryItems || data.inventory || data.items;
        const rawSales = data.sales;

        if (!Array.isArray(rawItems) && !Array.isArray(rawSales)) {
          throw new Error("Invalid backup format: Must contain inventory and sales records.");
        }

        const itemsList = Array.isArray(rawItems) ? rawItems : [];
        const salesList = Array.isArray(rawSales) ? rawSales : [];

        // Sanitize items
        const sanitizedItems: InventoryItem[] = itemsList
          .filter((it: any) => it && (it.label || it.id))
          .map((it: any) => ({
            id: String(it.id || genId()),
            label: String(it.label || "Item"),
            localLabel: String(it.localLabel || it.label || ""),
            unit: String(it.unit || "piece"),
            rate: Number(it.rate) || 0,
            isService: Boolean(it.isService),
            barcode: it.barcode ? String(it.barcode).trim() : undefined,
            stock: typeof it.stock === "number" ? it.stock : undefined,
            needsNaming: Boolean(it.needsNaming),
          }));

        // Sanitize sales
        const sanitizedSales: Sale[] = salesList
          .filter((s: any) => s && (Array.isArray(s.items) || s.id))
          .map((s: any) => ({
            id: String(s.id || genId()),
            date: String(s.date || new Date().toISOString()),
            items: Array.isArray(s.items)
              ? s.items.map((si: any) => ({
                  item_id: String(si.item_id || ""),
                  label: String(si.label || "Item"),
                  quantity: Number(si.quantity) || 1,
                  unit: String(si.unit || "piece"),
                  rate: Number(si.rate) || 0,
                  total: Number(si.total) || 0,
                  is_service: Boolean(si.is_service),
                }))
              : [],
            total: Number(s.total) || 0,
            note: String(s.note || ""),
            customerName: s.customerName ? String(s.customerName) : undefined,
            customerPhone: s.customerPhone ? String(s.customerPhone) : undefined,
            status: s.status === "unpaid" ? "unpaid" : "paid",
            paidAt: s.paidAt ? String(s.paidAt) : undefined,
          }));

        if (onConfirm) {
          const confirmed = await onConfirm({
            itemCount: sanitizedItems.length,
            saleCount: sanitizedSales.length,
            profile: data.profile,
          });
          if (!confirmed) return false;
        }

        await saveInventory(sanitizedItems);
        await saveSales(sanitizedSales);
        return true;
      } catch (e: any) {
        if (e?.message?.includes("Invalid backup format")) {
          throw e;
        }
        throw new Error("Please select a valid SaleSync .json backup file.");
      }
    },
    [saveInventory, saveSales]
  );

  return (
    <StoreContext.Provider
      value={{
        inventoryItems,
        sales,
        isLoading,
        addInventoryItem,
        addInventoryItems,
        updateInventoryItem,
        updateStock,
        deleteInventoryItem,
        addSale,
        deleteSale,
        getTodaySales,
        getTodayTotal,
        clearStore,
        exportData,
        importData,
        markSaleAsPaid,
        loadError,
        reloadStoreData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
