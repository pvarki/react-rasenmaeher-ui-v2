import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import fi from "@/locales/fi.json";
import sv from "@/locales/sv.json";
import { getLocalizedValue } from "./localization";

const supportedLanguages = ["en", "fi", "sv"];

const getUserLanguage = (): string => {
  const saved = localStorage.getItem("language");
  if (saved && supportedLanguages.includes(saved)) {
    return saved;
  }
  const browserLang = navigator.language?.split("-")[0];
  if (browserLang && supportedLanguages.includes(browserLang)) {
    return browserLang;
  }
  return "fi";
};

const savedLanguage = getUserLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fi: { translation: fi },
    sv: { translation: sv },
  },
  lng: savedLanguage,
  fallbackLng: "fi",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

const originalT = i18n.t.bind(i18n);

i18n.t = ((...args: Parameters<typeof originalT>) => {
  const [key] = args;
  const runtimeValue = typeof key === "string" ? getLocalizedValue(key) : "";
  if (runtimeValue) {
    return runtimeValue;
  }
  const result = originalT(...args);

  return result;
}) as unknown as typeof i18n.t;

export default i18n;
