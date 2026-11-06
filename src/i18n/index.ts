import { create } from "zustand";
import { zhCN } from "./zh-CN";

export type Locale = "zh-CN" | "en";
export const LOCALE_STORAGE_KEY = "netviz-language";
export const DEFAULT_LOCALE: Locale = "zh-CN";

export function readLocale(storage?: Pick<Storage, "getItem">): Locale {
  try {
    const saved = (storage ?? window.localStorage).getItem(LOCALE_STORAGE_KEY);
    return saved === "en" ? "en" : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function applyLocale(locale: Locale) {
  if (typeof document !== "undefined") document.documentElement.lang = locale;
}

export const useLocaleStore = create<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
}>(() => ({
  locale: readLocale(),
  setLocale: (locale) => {
    if (locale !== "zh-CN" && locale !== "en") return;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Language switching still works when browser storage is unavailable.
    }
    applyLocale(locale);
    useLocaleStore.setState({ locale });
  },
}));

/** Subscribe at component boundaries, including memoized canvas components. */
export function useLocale() {
  return useLocaleStore((state) => state.locale);
}

/** Translate interface messages only; never pass project names or editable content. */
export function translate(message: string, values?: Record<string, string | number>) {
  const localized = useLocaleStore.getState().locale === "zh-CN"
    ? (Object.hasOwn(zhCN, message) ? zhCN[message] : message)
    : message;
  return localized.replace(/\{(\w+)\}/g, (match, key: string) =>
    values?.[key] === undefined ? match : String(values[key])
  );
}
