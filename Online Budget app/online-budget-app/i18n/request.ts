import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, getValidLocale } from "./config";

export default getRequestConfig(async () => {
  // Read locale from cookie (set by app layout after fetching user_settings)
  const cookieStore = await cookies();
  const locale = getValidLocale(cookieStore.get("locale")?.value) || DEFAULT_LOCALE;

  let messages;
  if (locale.startsWith("en")) {
    messages = (await import("./messages/en.json")).default;
  } else {
    try {
      messages = (await import(`./messages/${locale}.json`)).default;
    } catch {
      messages = (await import("./messages/en.json")).default;
    }
  }

  return { locale, messages };
});
