import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type BusinessType, type Language, SUGGESTED_ITEMS } from "@/constants/translations";

export type StoreProfile = {
  id: string;
  name: string;
  phone: string;
  upi: string;
  address: string;
  backupEmail: string;
  businessType: BusinessType;
  createdAt: number;
};

type AppState = {
  language: Language;
  businessType: BusinessType;
  shopName: string;
  shopPhone: string;
  shopUpi: string;
  shopAddress: string;
  backupEmail: string;
  onboardingComplete: boolean;
  isAppLockEnabled: boolean;
  isLoading: boolean;
  // Multi-Store (Split Store)
  stores: StoreProfile[];
  activeStoreId: string;
  activeStore: StoreProfile;
  switchStore: (id: string) => Promise<void>;
  createStore: (
    storeData: {
      name: string;
      businessType: BusinessType;
      phone?: string;
      upi?: string;
      address?: string;
      backupEmail?: string;
    },
    populateStarterItems?: boolean
  ) => Promise<string>;
  deleteStore: (id: string) => Promise<void>;
  // Existing profile setters (apply to active store)
  setLanguage: (lang: Language) => Promise<void>;
  setBusinessType: (bt: BusinessType) => Promise<void>;
  setShopName: (name: string) => Promise<void>;
  setShopPhone: (phone: string) => Promise<void>;
  setShopUpi: (upi: string) => Promise<void>;
  setShopAddress: (address: string) => Promise<void>;
  setBackupEmail: (email: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setAppLockEnabled: (enabled: boolean) => Promise<void>;
  restoreProfile: (profile: {
    shopName?: string;
    shopPhone?: string;
    shopUpi?: string;
    shopAddress?: string;
    backupEmail?: string;
    businessType?: BusinessType;
    language?: Language;
  }) => Promise<void>;
  resetApp: () => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEYS = {
  LANGUAGE: "app_language",
  ONBOARDING: "app_onboarding_complete",
  APP_LOCK: "app_lock_enabled",
  STORES_LIST: "app_stores_list",
  ACTIVE_STORE_ID: "app_active_store_id",
  // Legacy keys for migration:
  LEGACY_SHOP_NAME: "app_shop_name",
  LEGACY_SHOP_PHONE: "app_shop_phone",
  LEGACY_SHOP_UPI: "app_shop_upi",
  LEGACY_SHOP_ADDRESS: "app_shop_address",
  LEGACY_BACKUP_EMAIL: "app_backup_email",
  LEGACY_BUSINESS_TYPE: "app_business_type",
};

const createDefaultStore = (overrides?: Partial<StoreProfile>): StoreProfile => ({
  id: "store_default",
  name: "My Dukaan",
  phone: "",
  upi: "",
  address: "",
  backupEmail: "",
  businessType: "kirana",
  createdAt: Date.now(),
  ...overrides,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);
  const [isAppLockEnabled, setIsAppLockEnabledState] = useState<boolean>(false);
  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string>("store_default");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadState() {
      try {
        const [lang, ob, lock, storesJson, activeId] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
          AsyncStorage.getItem(STORAGE_KEYS.APP_LOCK),
          AsyncStorage.getItem(STORAGE_KEYS.STORES_LIST),
          AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_STORE_ID),
        ]);

        if (lang) setLanguageState(lang as Language);
        if (ob === "true") setOnboardingComplete(true);
        if (lock === "true") setIsAppLockEnabledState(true);

        let loadedStores: StoreProfile[] = [];
        if (storesJson) {
          try {
            loadedStores = JSON.parse(storesJson);
          } catch {}
        }

        // Migration: If no stores list exists, check for legacy single store data
        if (!loadedStores || loadedStores.length === 0) {
          const [legName, legPhone, legUpi, legAddr, legEmail, legBt] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.LEGACY_SHOP_NAME),
            AsyncStorage.getItem(STORAGE_KEYS.LEGACY_SHOP_PHONE),
            AsyncStorage.getItem(STORAGE_KEYS.LEGACY_SHOP_UPI),
            AsyncStorage.getItem(STORAGE_KEYS.LEGACY_SHOP_ADDRESS),
            AsyncStorage.getItem(STORAGE_KEYS.LEGACY_BACKUP_EMAIL),
            AsyncStorage.getItem(STORAGE_KEYS.LEGACY_BUSINESS_TYPE),
          ]);

          const initialStore = createDefaultStore({
            name: legName || "",
            phone: legPhone || "",
            upi: legUpi || "",
            address: legAddr || "",
            backupEmail: legEmail || "",
            businessType: (legBt as BusinessType) || "kirana",
          });

          loadedStores = [initialStore];
          await AsyncStorage.setItem(STORAGE_KEYS.STORES_LIST, JSON.stringify(loadedStores));
          await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_STORE_ID, initialStore.id);

          // Migrate legacy inventory/sales keys to default store scoped keys if they exist
          const [oldInv, oldSales] = await Promise.all([
            AsyncStorage.getItem("store_inventory"),
            AsyncStorage.getItem("store_sales"),
          ]);
          if (oldInv) {
            await AsyncStorage.setItem(`store_inventory_${initialStore.id}`, oldInv);
          }
          if (oldSales) {
            await AsyncStorage.setItem(`store_sales_${initialStore.id}`, oldSales);
          }
        }

        setStores(loadedStores);

        const targetActiveId =
          activeId && loadedStores.some((s) => s.id === activeId)
            ? activeId
            : loadedStores[0]?.id || "store_default";

        setActiveStoreId(targetActiveId);
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_STORE_ID, targetActiveId);
      } catch {
        // ignore storage errors
      } finally {
        setIsLoading(false);
      }
    }
    loadState();
  }, []);

  const activeStore = useMemo(() => {
    return stores.find((s) => s.id === activeStoreId) || stores[0] || createDefaultStore();
  }, [stores, activeStoreId]);

  const shopName = activeStore.name;
  const shopPhone = activeStore.phone;
  const shopUpi = activeStore.upi;
  const shopAddress = activeStore.address;
  const backupEmail = activeStore.backupEmail;
  const businessType = activeStore.businessType;

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }, []);

  const completeOnboarding = useCallback(async () => {
    setOnboardingComplete(true);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, "true");
  }, []);

  const setAppLockEnabled = useCallback(async (enabled: boolean) => {
    setIsAppLockEnabledState(enabled);
    if (enabled) {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_LOCK, "true");
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.APP_LOCK);
    }
  }, []);

  const updateActiveStoreField = useCallback(
    async (field: keyof StoreProfile, value: any) => {
      setStores((prev) => {
        const next = prev.map((s) => (s.id === activeStoreId ? { ...s, [field]: value } : s));
        AsyncStorage.setItem(STORAGE_KEYS.STORES_LIST, JSON.stringify(next));
        return next;
      });
    },
    [activeStoreId]
  );

  const setShopName = useCallback((name: string) => updateActiveStoreField("name", name), [updateActiveStoreField]);
  const setShopPhone = useCallback((phone: string) => updateActiveStoreField("phone", phone), [updateActiveStoreField]);
  const setShopUpi = useCallback((upi: string) => updateActiveStoreField("upi", upi), [updateActiveStoreField]);
  const setShopAddress = useCallback((address: string) => updateActiveStoreField("address", address), [updateActiveStoreField]);
  const setBackupEmail = useCallback((email: string) => updateActiveStoreField("backupEmail", email), [updateActiveStoreField]);
  const setBusinessType = useCallback((bt: BusinessType) => updateActiveStoreField("businessType", bt), [updateActiveStoreField]);

  const switchStore = useCallback(async (id: string) => {
    setActiveStoreId(id);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_STORE_ID, id);
  }, []);

  const createStore = useCallback(
    async (
      storeData: {
        name: string;
        businessType: BusinessType;
        phone?: string;
        upi?: string;
        address?: string;
        backupEmail?: string;
      },
      populateStarterItems: boolean = true
    ): Promise<string> => {
      const newId = `store_${Date.now()}`;
      const newStore: StoreProfile = {
        id: newId,
        name: storeData.name.trim(),
        businessType: storeData.businessType,
        phone: storeData.phone?.trim() || "",
        upi: storeData.upi?.trim() || "",
        address: storeData.address?.trim() || "",
        backupEmail: storeData.backupEmail?.trim() || "",
        createdAt: Date.now(),
      };

      if (populateStarterItems) {
        const suggested = SUGGESTED_ITEMS[newStore.businessType] ?? SUGGESTED_ITEMS.other;
        const starterItems = suggested.map((item) => {
          const itemLabel = language === "hi" ? item.hi : language === "mr" ? item.mr : item.en;
          return {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            label: item.en,
            localLabel: itemLabel,
            unit: item.unit,
            rate: item.rate,
            isService: item.isService,
            needsNaming: false,
          };
        });
        await AsyncStorage.setItem(`store_inventory_${newId}`, JSON.stringify(starterItems));
      }

      setStores((prev) => {
        const next = [...prev, newStore];
        AsyncStorage.setItem(STORAGE_KEYS.STORES_LIST, JSON.stringify(next));
        return next;
      });

      setActiveStoreId(newId);
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_STORE_ID, newId);
      return newId;
    },
    [language]
  );

  const deleteStore = useCallback(
    async (id: string) => {
      if (stores.length <= 1) {
        throw new Error("Cannot delete the only store profile.");
      }

      const remainingStores = stores.filter((s) => s.id !== id);
      setStores(remainingStores);
      await AsyncStorage.setItem(STORAGE_KEYS.STORES_LIST, JSON.stringify(remainingStores));

      // Remove isolated inventory and sales
      await Promise.all([
        AsyncStorage.removeItem(`store_inventory_${id}`),
        AsyncStorage.removeItem(`store_sales_${id}`),
      ]);

      // If active store was deleted, switch to first remaining store
      if (activeStoreId === id) {
        const nextActiveId = remainingStores[0].id;
        setActiveStoreId(nextActiveId);
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_STORE_ID, nextActiveId);
      }
    },
    [stores, activeStoreId]
  );

  const restoreProfile = useCallback(
    async (profile: {
      shopName?: string;
      shopPhone?: string;
      shopUpi?: string;
      shopAddress?: string;
      backupEmail?: string;
      businessType?: BusinessType;
      language?: Language;
    }) => {
      setStores((prev) => {
        const next = prev.map((s) => {
          if (s.id === activeStoreId) {
            return {
              ...s,
              name: profile.shopName !== undefined ? profile.shopName : s.name,
              phone: profile.shopPhone !== undefined ? profile.shopPhone : s.phone,
              upi: profile.shopUpi !== undefined ? profile.shopUpi : s.upi,
              address: profile.shopAddress !== undefined ? profile.shopAddress : s.address,
              backupEmail: profile.backupEmail !== undefined ? profile.backupEmail : s.backupEmail,
              businessType: profile.businessType !== undefined ? profile.businessType : s.businessType,
            };
          }
          return s;
        });
        AsyncStorage.setItem(STORAGE_KEYS.STORES_LIST, JSON.stringify(next));
        return next;
      });

      if (profile.language) {
        setLanguageState(profile.language);
        await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, profile.language);
      }
    },
    [activeStoreId]
  );

  const resetApp = useCallback(async () => {
    const keysToRemove = [
      STORAGE_KEYS.LANGUAGE,
      STORAGE_KEYS.ONBOARDING,
      STORAGE_KEYS.APP_LOCK,
      STORAGE_KEYS.STORES_LIST,
      STORAGE_KEYS.ACTIVE_STORE_ID,
      "store_inventory",
      "store_sales",
    ];
    for (const store of stores) {
      keysToRemove.push(`store_inventory_${store.id}`);
      keysToRemove.push(`store_sales_${store.id}`);
    }
    await AsyncStorage.multiRemove(keysToRemove);

    const freshStore = createDefaultStore();
    setLanguageState("en");
    setStores([freshStore]);
    setActiveStoreId(freshStore.id);
    setOnboardingComplete(false);
    setIsAppLockEnabledState(false);
  }, [stores]);

  return (
    <AppContext.Provider
      value={{
        language,
        businessType,
        shopName,
        shopPhone,
        shopUpi,
        shopAddress,
        backupEmail,
        onboardingComplete,
        isAppLockEnabled,
        isLoading,
        stores,
        activeStoreId,
        activeStore,
        switchStore,
        createStore,
        deleteStore,
        setLanguage,
        setBusinessType,
        setShopName,
        setShopPhone,
        setShopUpi,
        setShopAddress,
        setBackupEmail,
        completeOnboarding,
        setAppLockEnabled,
        restoreProfile,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
