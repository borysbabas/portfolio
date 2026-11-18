export default defineEventHandler(async (event) => {
    await requireStash(event);
    await stashDb("stash_items", { method: "DELETE", query: { id: `eq.${itemId(event)}` } });
    return { deleted: true };
});
