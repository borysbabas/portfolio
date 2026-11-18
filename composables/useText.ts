import { computed } from "vue";
import { siteText, type Locale } from "~/content/site";

/** The site's text in the language of the current URL (/, /nl or /pl). */
export function useText() {
    const { locale } = useI18n();
    return computed(() => siteText[locale.value as Locale] ?? siteText.en);
}
