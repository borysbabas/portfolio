import type { StashItem } from "../../utils/stash";

export default defineEventHandler(async (event) => {
    await requireStash(event);
    const { link, text } = await readLinkBody(event);
    const row = await readCardRow(link, text);
    const [item] = await stashDb<StashItem[]>("stash_items", { method: "POST", body: { url: link.href, ...row } });
    return item;
});
