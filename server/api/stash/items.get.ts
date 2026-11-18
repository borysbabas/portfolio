import type { StashItem } from "../../utils/stash";

export default defineEventHandler(async (event) => {
    await requireStash(event);
    return stashDb<StashItem[]>("stash_items", { query: { select: "*", order: "created_at.desc" } });
});
