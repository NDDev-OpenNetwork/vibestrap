import { m } from "#/shared/lib/i18n/messages";
import { useLocale } from "#/shared/lib/locales";

export const HomePage = () => {
  const locale = useLocale();
  return (
    <h1 className="text-xl font-semibold tracking-tight">
      {m.home_page({}, { locale })}
    </h1>
  );
};
