import type { StashItem } from "../../utils/stash";

const WEEK = 7 * 24 * 60 * 60 * 1000;
// The job runs once a day at a fixed hour; an hour of slack keeps a card from slipping
// a day when one run happens to start a little earlier than the last
const SLACK = 60 * 60 * 1000;

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/Amsterdam" });

/** Daily, from Vercel Cron: one email listing every card that is a week old, or a week past its last reminder. */
export default defineEventHandler(async (event) => {
    // Vercel Cron sends the project's CRON_SECRET as a bearer token
    const auth = getHeader(event, "authorization") ?? "";
    if (!stashEnv.cronSecret || !secretMatches(auth, `Bearer ${stashEnv.cronSecret}`)) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const now = Date.now();
    const due = new Date(now - WEEK + SLACK).toISOString();
    const items = await stashDb<StashItem[]>("stash_items", {
        query: {
            select: "*",
            remind: "eq.true",
            created_at: `lte.${due}`,
            or: `(last_reminded_at.is.null,last_reminded_at.lte.${due})`,
            order: "created_at.asc",
        },
    });
    if (!items.length) return { sent: 0 };

    const site = stashEnv.siteUrl;
    const cards = items
        .map((item) => {
            const stop = `${site}/stash/stop?id=${item.id}&token=${stopToken(item.id)}`;
            return `
<tr><td style="padding:20px 0;border-top:1px solid #e3e0dc">
  ${item.image ? `<img src="${escapeHtml(item.image)}" alt="" width="120" style="float:right;margin:0 0 8px 16px;border-radius:8px">` : ""}
  <p style="margin:0 0 6px;font:12px ui-monospace,Menlo,monospace;color:#5F5C58;text-transform:uppercase">${escapeHtml(item.kind)} · saved ${formatDate(item.created_at)}</p>
  <a href="${site}/stash/${item.id}" style="font-size:18px;font-weight:600;color:#111111;text-decoration:none">${escapeHtml(item.title)}</a>
  <p style="margin:6px 0 10px;color:#5F5C58;line-height:1.5">${escapeHtml(item.summary)}</p>
  <a href="${escapeHtml(item.url)}" style="font-size:13px;color:#5F5C58;margin-right:16px">Saved link</a>
  <a href="${stop}" style="font-size:13px;color:#5F5C58">Stop reminding me about this</a>
</td></tr>`;
        })
        .join("");
    const html = `
<div style="max-width:560px;margin:0 auto;font-family:-apple-system,'Segoe UI',sans-serif;color:#111111">
  <h1 style="font-size:24px;margin:0 0 4px">Still worth a look?</h1>
  <p style="margin:0 0 16px;color:#5F5C58">You saved ${items.length === 1 ? "this" : "these"} a while ago.</p>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${cards}</table>
  <p style="margin-top:24px"><a href="${site}/stash" style="color:#111111">Open your stash</a></p>
</div>`;

    // Only mark them reminded once the email is out, so a failed send is retried tomorrow
    await sendStashEmail(`${items.length} saved ${items.length === 1 ? "link" : "links"} from your stash`, html);
    await stashDb("stash_items", {
        method: "PATCH",
        query: { id: `in.(${items.map((item) => item.id).join(",")})` },
        body: { last_reminded_at: new Date(now).toISOString() },
    });
    return { sent: items.length };
});
