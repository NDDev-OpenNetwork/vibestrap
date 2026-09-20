import type { Locale } from "./i18n/runtime";

export const localeLabels = {
  ru: { short: "RU", name: "Русский" },
  kk: { short: "KZ", name: "Қазақша" },
  en: { short: "EN", name: "English" },
} satisfies Record<Locale, { short: string; name: string }>;
