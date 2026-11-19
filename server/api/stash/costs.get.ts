import Anthropic from "@anthropic-ai/sdk";

/**
 * What Claude cost this month and last, in dollars, from Anthropic's cost report for the whole organization.
 * Null without an admin key or when the report can't be read; the page then leaves the line out.
 */
export default defineEventHandler(async (event) => {
    await requireStash(event);
    if (!stashEnv.anthropicAdminKey) return null;

    const client = new Anthropic({ apiKey: stashEnv.anthropicAdminKey });
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const lastStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    // Without group_by or time buckets the report is one row for the whole range (none when nothing was spent), in cents
    const dollars = async (from: Date, to: Date) => {
        const page = await client.beta.organization.analytics.cost.list({ starting_at: from.toISOString(), ending_at: to.toISOString() });
        return page.data.reduce((sum, row) => sum + Number(row.cost.amount), 0) / 100;
    };
    try {
        const [month, last] = await Promise.all([dollars(monthStart, now), dollars(lastStart, monthStart)]);
        return { month, last };
    } catch (error) {
        console.error("stash: reading the cost report failed", error);
        return null;
    }
});
