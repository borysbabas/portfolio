import type { StashItem } from "../../../../utils/stash";

/** "Read again": rebuilds a card from its link, with newly pasted text if there is any. */
export default defineEventHandler(async (event) => {
    await requireStash(event);
    const id = itemId(event);
    const [current] = await stashDb<StashItem[]>("stash_items", { query: { select: "url", id: `eq.${id}` } });
    if (!current) throw stashError(404, "unknown_card", "Unknown card");
    const { link, text, lang } = await readLinkBody(event, current.url);
    // A new reading replaces details wholesale, translations included, so no stale translation survives it
    const row = await readCardRow(link, text);
    const [item] = await stashDb<StashItem[]>("stash_items", { method: "PATCH", query: { id: `eq.${id}` }, body: row });
    return localizeItem(item!, lang, true);
});
