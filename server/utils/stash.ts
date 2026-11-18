import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { H3Event } from "h3";

export interface StashItem {
    id: string;
    url: string;
    kind: "recipe" | "product" | "article" | "place" | "video" | "other";
    title: string;
    summary: string;
    site: string;
    image: string | null;
    details: { facts?: { label: string; value: string }[]; list_title?: string; list?: string[] };
    tags: string[];
    remind: boolean;
    last_reminded_at: string | null;
    created_at: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Read at request time from the Vercel project's environment variables (see .env.example). */
export const stashEnv = {
    get password() { return process.env.STASH_PASSWORD ?? ""; },
    get secret() { return process.env.STASH_SECRET ?? ""; },
    get cronSecret() { return process.env.CRON_SECRET ?? ""; },
    get email() { return process.env.STASH_EMAIL || "info@borysbabas.dev"; },
    get supabaseUrl() { return process.env.DB_SUPABASE_URL ?? ""; },
    get supabaseKey() { return process.env.DB_SUPABASE_SERVICE_ROLE_KEY ?? ""; },
    get resendApiKey() { return process.env.RESEND_API_KEY ?? ""; },
    siteUrl: "https://borysbabas.dev",
};

/** Missing secrets fail closed: no password configured means no way in. */
function stashConfig() {
    if (!stashEnv.password || stashEnv.secret.length < 32) {
        throw createError({ statusCode: 503, statusMessage: "The stash isn't configured" });
    }
    return stashEnv;
}

/** Constant-time comparison for passwords and secrets of any length. */
export function secretMatches(input: string, expected: string): boolean {
    const digest = (value: string) => createHash("sha256").update(value).digest();
    return timingSafeEqual(digest(input), digest(expected));
}

export function useStashSession(event: H3Event) {
    return useSession<{ authed?: boolean }>(event, {
        name: "stash",
        password: stashConfig().secret,
        maxAge: 60 * 60 * 24 * 30,
        // Lax keeps the cookie off cross-site POSTs, which is the CSRF protection for the routes below
        cookie: { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
    });
}

export async function requireStash(event: H3Event) {
    const session = await useStashSession(event);
    if (!session.data.authed) {
        throw createError({ statusCode: 401, statusMessage: "Sign in first" });
    }
}

export function passwordMatches(input: string): boolean {
    return secretMatches(input, stashConfig().password);
}

/** Item ids go into PostgREST filters, so only a well-formed UUID gets through. */
export function itemId(event: H3Event): string {
    const id = getRouterParam(event, "id") ?? "";
    if (!UUID.test(id)) throw createError({ statusCode: 400, statusMessage: "Unknown card" });
    return id;
}

/** Signs the "stop reminding me" link in the reminder email, so it works without signing in. */
export function stopToken(id: string): string {
    return createHmac("sha256", stashConfig().secret).update(`stop:${id}`).digest("base64url");
}

export function stopTokenMatches(id: string, token: string): boolean {
    return UUID.test(id) && secretMatches(token, stopToken(id));
}

/** Supabase's REST API with the service key, which RLS lets through and the public anon key does not. */
export function stashDb<T>(
    path: string,
    options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; query?: Record<string, string>; body?: unknown } = {},
) {
    // Without a base URL $fetch would quietly call this server instead
    if (!stashEnv.supabaseUrl || !stashEnv.supabaseKey) {
        throw createError({ statusCode: 503, statusMessage: "The stash isn't configured" });
    }
    return $fetch<T>(`/rest/v1/${path}`, {
        baseURL: stashEnv.supabaseUrl,
        method: options.method ?? "GET",
        query: options.query,
        body: options.body as Record<string, unknown> | undefined,
        headers: {
            apikey: stashEnv.supabaseKey,
            Authorization: `Bearer ${stashEnv.supabaseKey}`,
            Prefer: "return=representation",
        },
    });
}

export function sendStashEmail(subject: string, html: string) {
    return $fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${stashEnv.resendApiKey}` },
        body: { from: "Stash <stash@borysbabas.dev>", to: [stashEnv.email], subject, html },
    });
}

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function isWebUrl(value: unknown): value is string {
    if (typeof value !== "string") return false;
    try {
        const { protocol } = new URL(value);
        return protocol === "https:" || protocol === "http:";
    } catch {
        return false;
    }
}
