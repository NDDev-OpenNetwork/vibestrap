import { ClientOnly } from "@tanstack/react-router";

import { m } from "#/shared/lib/i18n/messages";
import { getLocale, locales, setLocale } from "#/shared/lib/i18n/runtime";
import { localeLabels } from "#/shared/lib/locales";

import { Button } from "./shadcn/button";

const LocaleSwitcherContent = () => (
  <fieldset className="flex shrink-0 gap-1">
    <legend className="sr-only">{m.language_label()}</legend>
    {locales.map((locale) => (
      <Button
        key={locale}
        size="sm"
        variant={locale === getLocale() ? "secondary" : "ghost"}
        aria-pressed={locale === getLocale()}
        aria-label={localeLabels[locale].name}
        lang={locale}
        onClick={() => {
          void setLocale(locale);
        }}
      >
        {localeLabels[locale].short}
      </Button>
    ))}
  </fieldset>
);

const LocaleSwitcher = () => (
  <ClientOnly>
    <LocaleSwitcherContent />
  </ClientOnly>
);

export default LocaleSwitcher;
