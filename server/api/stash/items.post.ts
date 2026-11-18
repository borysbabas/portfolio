import Anthropic from "@anthropic-ai/sdk";
import type { StashCard } from "../../utils/stash-card";
import type { StashItem } from "../../utils/stash";

export default defineEventHandler(async (event) => {
    await requireStash(event);
    const { url } = await readBody<{ url?: unknown }>(event);
    if (!isWebUrl(typeof url === "string" ? url.trim() : url)) {
        throw createError({ statusCode: 400, statusMessage: "That isn't a web link" });
    }
    const link = new URL((url as string).trim());

    const meta = await readPageMeta(link);
    let card: StashCard;
    try {
        card = await readCard(link, meta);
    } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
            throw createError({ statusCode: 429, statusMessage: "Claude is busy, try again in a minute" });
        }
        if (error instanceof Anthropic.APIError) {
            throw createError({ statusCode: 502, statusMessage: `Claude couldn't read this link (${error.status})` });
        }
        throw error;
    }

    const [item] = await stashDb<StashItem[]>("stash_items", {
        method: "POST",
        body: {
            url: link.href,
            kind: card.kind,
            title: card.title || meta.title || link.hostname,
            summary: card.summary,
            site: card.site,
            image: [meta.image, card.image].find(isWebUrl) ?? null,
            details: { facts: card.facts, list_title: card.list_title, list: card.list },
            tags: card.tags,
        },
    });
    return item;
});
