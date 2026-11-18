import type { StashItem } from "../../../utils/stash";

export default defineEventHandler(async (event) => {
    await requireStash(event);
    const [item] = await stashDb<StashItem[]>("stash_items", { query: { select: "*", id: `eq.${itemId(event)}` } });
    if (!item) throw createError({ statusCode: 404, statusMessage: "Unknown card" });
    return item;
});
