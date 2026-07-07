import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import Constants from "expo-constants";

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
  exportData: () => Promise<void>;
  importData: () => Promise<boolean>;
  markSaleAsPaid: (id: string) => Promise<void>;
};

const StoreContext = createContext<StoreState | null>(null);

const STORAGE_KEYS = {
  INVENTORY: "store_inventory",
  SALES: "store_sales",
};

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const posthog = usePostHog ? usePostHog() : null;

  useEffect(() => {
    async function load() {
      try {
        const [inv, sal] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.INVENTORY),
          AsyncStorage.getItem(STORAGE_KEYS.SALES),
        ]);
        if (inv) setInventoryItems(JSON.parse(inv) as InventoryItem[]);
        if (sal) setSales(JSON.parse(sal) as Sale[]);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const saveInventory = useCallback(async (items: InventoryItem[]) => {
    setInventoryItems(items);
    await AsyncStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
  }, []);

  const saveSales = useCallback(async (s: Sale[]) => {
    setSales(s);
    await AsyncStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(s));
  }, []);

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
    await AsyncStorage.multiRemove([STORAGE_KEYS.INVENTORY, STORAGE_KEYS.SALES]);
    setInventoryItems([]);
    setSales([]);
  }, []);

  const exportData = useCallback(async () => {
    try {
      const data = {
        inventoryItems,
        sales,
      };
      const jsonString = JSON.stringify(data, null, 2);
      const fileUri = `${FileSystem.cacheDirectory}SaleSync_Backup.json`;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonString);

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
  }, [inventoryItems, sales]);

  const importData = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "text/plain", "*/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return false;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);

      const data = JSON.parse(fileContent);

      if (Array.isArray(data.inventoryItems) && Array.isArray(data.sales)) {
        await saveInventory(data.inventoryItems);
        await saveSales(data.sales);
        return true;
      } else {
        throw new Error("Invalid backup format");
      }
    } catch (e) {
      throw new Error("Please select a valid SaleSync .json backup file.");
    }
  }, [saveInventory, saveSales]);

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
