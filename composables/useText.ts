import { computed } from "vue";
import { siteText, type Locale } from "~/content/site";

const LANG_TAGS: Record<Locale, string> = { en: "en-GB", nl: "nl-NL", pl: "pl-PL" };

/** The site's text in the language of the current URL (/, /nl or /pl). */
export function useText() {
    const { locale } = useI18n();
    return computed(() => siteText[locale.value as Locale] ?? siteText.en);
}

/** Fills placeholders: fillText("Step {n} of {total}", { n: 2, total: 5 }). */
export const fillText = (template: string, params: Record<string, string | number>) =>
    template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? ""));

/** Dates the way the current language writes them, e.g. "18 Nov 2026" or "18 lis 2026". */
export function useFormatDate() {
    const { locale } = useI18n();
    return (iso: string) =>
        new Date(iso).toLocaleDateString(LANG_TAGS[locale.value as Locale] ?? "en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Dollars the way the current language writes them, e.g. "$4.12" or "4,12 $". */
export function useFormatUsd() {
    const { locale } = useI18n();
    return (usd: number) =>
        usd.toLocaleString(LANG_TAGS[locale.value as Locale] ?? "en-GB", { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol" });
}

/** The current language's wording for an error from the stash API, which sends a code rather than a sentence. */
export function useStashError() {
    const text = useText();
    return (e: unknown) => {
        const data = (e as { data?: { data?: { code?: string; left?: number; minutes?: number } } })?.data?.data;
        const errors = text.value.stash.errors;
        if (data?.code === "wrong_password") {
            const left = data.left ?? 0;
            return left > 1 ? fillText(errors.wrong_password_many!, { left }) : left === 1 ? errors.wrong_password_one! : errors.wrong_password_none!;
        }
        const message = data?.code ? errors[data.code] : undefined;
        return message ? fillText(message, { minutes: data?.minutes ?? "" }) : errors.generic!;
    };
}
