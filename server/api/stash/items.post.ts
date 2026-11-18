import type { StashItem } from "../../utils/stash";

export default defineEventHandler(async (event) => {
    await requireStash(event);
    const { link, text, lang } = await readLinkBody(event);
    const row = await readCardRow(link, text);
    const [item] = await stashDb<StashItem[]>("stash_items", { method: "POST", body: { url: link.href, ...row } });
    return localizeItem(item!, lang);
});
