import type { StashItem } from "../../../utils/stash";

export default defineEventHandler(async (event) => {
    await requireStash(event);
    const [item] = await stashDb<StashItem[]>("stash_items", { query: { select: "*", id: `eq.${itemId(event)}` } });
    if (!item) throw stashError(404, "unknown_card", "Unknown card");
    // ?translate=1 is the page asking for a missing translation once it's on screen
    const query = getQuery(event);
    return localizeItem(item, stashLang(query.lang), query.translate === "1");
});
