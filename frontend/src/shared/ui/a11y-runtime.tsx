import { useEffect } from "react";

import { applyA11ySettings, useA11ySettings } from "#/shared/lib/a11y-settings";
import { getLocale } from "#/shared/lib/i18n/runtime";

const speechLanguages = { ru: "ru-RU", kk: "kk-KZ", en: "en-US" } as const;

export const A11yRuntime = () => {
  const settings = useA11ySettings();
  useEffect(() => {
    applyA11ySettings(settings, document.documentElement);
  }, [settings]);

  useEffect(() => {
    if (!settings.speech || !("speechSynthesis" in window)) return undefined;
    const speak = () => {
      const selection = window.getSelection();
      const parent = selection?.anchorNode?.parentElement;
      if (parent?.closest("input, textarea, [contenteditable], [role=textbox]"))
        return;
      const text = selection?.toString().trim();
      if (!text) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 10_000));
      utterance.lang = speechLanguages[getLocale()];
      window.speechSynthesis.speak(utterance);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") speak();
    };
    document.addEventListener("pointerup", speak);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("pointerup", speak);
      document.removeEventListener("keyup", onKeyUp);
      window.speechSynthesis.cancel();
    };
  }, [settings.speech]);
  return null;
};
