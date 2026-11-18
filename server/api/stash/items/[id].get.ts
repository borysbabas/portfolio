import type { StashItem } from "../../../utils/stash";

export default defineEventHandler(async (event) => {
    await requireStash(event);
    const [item] = await stashDb<StashItem[]>("stash_items", { query: { select: "*", id: `eq.${itemId(event)}` } });
    if (!item) throw stashError(404, "unknown_card", "Unknown card");
    return localizeItem(item, stashLang(getQuery(event).lang));
});
