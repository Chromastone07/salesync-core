import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type BusinessType, type Language } from "@/constants/translations";

type AppState = {
  language: Language;
  businessType: BusinessType;
  shopName: string;
  onboardingComplete: boolean;
  isLoading: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  setBusinessType: (bt: BusinessType) => Promise<void>;
  setShopName: (name: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetApp: () => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEYS = {
  LANGUAGE: "app_language",
  BUSINESS_TYPE: "app_business_type",
  SHOP_NAME: "app_shop_name",
  ONBOARDING: "app_onboarding_complete",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [businessType, setBusinessTypeState] = useState<BusinessType>("kirana");
  const [shopName, setShopNameState] = useState<string>("");
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadState() {
      try {
        const [lang, bt, sn, ob] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
          AsyncStorage.getItem(STORAGE_KEYS.BUSINESS_TYPE),
          AsyncStorage.getItem(STORAGE_KEYS.SHOP_NAME),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
        ]);
        if (lang) setLanguageState(lang as Language);
        if (bt) setBusinessTypeState(bt as BusinessType);
        if (sn) setShopNameState(sn);
        if (ob === "true") setOnboardingComplete(true);
      } catch {
        // ignore storage errors
      } finally {
        setIsLoading(false);
      }
    }
    loadState();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }, []);

  const setBusinessType = useCallback(async (bt: BusinessType) => {
    setBusinessTypeState(bt);
    await AsyncStorage.setItem(STORAGE_KEYS.BUSINESS_TYPE, bt);
  }, []);

  const setShopName = useCallback(async (name: string) => {
    setShopNameState(name);
    await AsyncStorage.setItem(STORAGE_KEYS.SHOP_NAME, name);
  }, []);

  const completeOnboarding = useCallback(async () => {
    setOnboardingComplete(true);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, "true");
  }, []);

  const resetApp = useCallback(async () => {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    setLanguageState("en");
    setBusinessTypeState("kirana");
    setShopNameState("");
    setOnboardingComplete(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        businessType,
        shopName,
        onboardingComplete,
        isLoading,
        setLanguage,
        setBusinessType,
        setShopName,
        completeOnboarding,
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
