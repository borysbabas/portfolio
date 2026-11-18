import type { StashItem } from "../../../../utils/stash";

/** "Read again": rebuilds a card from its link, with newly pasted text if there is any. */
export default defineEventHandler(async (event) => {
    await requireStash(event);
    const id = itemId(event);
    const [current] = await stashDb<StashItem[]>("stash_items", { query: { select: "url", id: `eq.${id}` } });
    if (!current) throw createError({ statusCode: 404, statusMessage: "Unknown card" });
    const { link, text } = await readLinkBody(event, current.url);
    const row = await readCardRow(link, text);
    const [item] = await stashDb<StashItem[]>("stash_items", { method: "PATCH", query: { id: `eq.${id}` }, body: row });
    return item;
});
