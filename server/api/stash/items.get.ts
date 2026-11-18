import type { StashItem } from "../../utils/stash";

export default defineEventHandler(async (event) => {
    await requireStash(event);
    const lang = stashLang(getQuery(event).lang);
    const items = await stashDb<StashItem[]>("stash_items", { query: { select: "*", order: "created_at.desc" } });
    // Cards not yet translated into this language are translated now, side by side, and stored for next time
    return Promise.all(items.map((item) => localizeItem(item, lang)));
});
