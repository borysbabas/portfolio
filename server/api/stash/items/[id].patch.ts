import type { StashItem } from "../../../utils/stash";

export default defineEventHandler(async (event) => {
    await requireStash(event);
    const id = itemId(event);
    const { remind } = await readBody<{ remind?: unknown }>(event);
    if (typeof remind !== "boolean") throw createError({ statusCode: 400, statusMessage: "remind must be true or false" });
    const [item] = await stashDb<StashItem[]>("stash_items", { method: "PATCH", query: { id: `eq.${id}` }, body: { remind } });
    if (!item) throw createError({ statusCode: 404, statusMessage: "Unknown card" });
    return item;
});
