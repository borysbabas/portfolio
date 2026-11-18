import type { StashItem } from "../../utils/stash";

// The reminder email's "stop reminding me" link lands on /stash/stop, which posts here.
// It is signed per card, so it works without signing in, and only from a button press:
// mail scanners that open links on arrival can't switch reminders off.
export default defineEventHandler(async (event) => {
    const { id, token } = await readBody<{ id?: unknown; token?: unknown }>(event);
    if (typeof id !== "string" || typeof token !== "string" || !stopTokenMatches(id, token)) {
        throw createError({ statusCode: 403, statusMessage: "This link isn't valid" });
    }
    const [item] = await stashDb<StashItem[]>("stash_items", { method: "PATCH", query: { id: `eq.${id}` }, body: { remind: false } });
    if (!item) throw createError({ statusCode: 404, statusMessage: "That card is gone" });
    return { title: item.title };
});
