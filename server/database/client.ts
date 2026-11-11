import type {PostgresJsDatabase} from "drizzle-orm/postgres-js";
import {drizzle} from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy connection initialization
let _db: PostgresJsDatabase<typeof schema> | null = null;
let _sql: ReturnType<typeof postgres> | null = null;

// Function to get database URL from various sources
function getDatabaseUrl(): string {
    // First try process.env (for scripts, migrations, and Nuxt server)
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }

    // In Nuxt server context, try runtime config
    try {
        // @ts-ignore - useRuntimeConfig is available in Nuxt server context
        const config = useRuntimeConfig?.();
        if (config?.databaseUrl) {
            return config.databaseUrl;
        }
    } catch (e) {
        // Runtime config not available (likely running outside Nuxt context)
    }

    throw new Error(
        "DATABASE_URL environment variable is required. Make sure it's set in your .env file.",
    );
}

// Supabase refuses unencrypted connections (ESSLREQUIRED), so require TLS for
// any remote host. A local Postgres usually has no TLS, so leave it off there.
// An explicit ?sslmode= / ?ssl= in the connection string is left in charge:
// postgres.js lets an `ssl` option override it, so only set one when it's absent.
function sslOptions(connectionString: string): { ssl?: "require" } {
    try {
        const url = new URL(connectionString);
        if (url.searchParams.has("sslmode") || url.searchParams.has("ssl")) {
            return {};
        }
        if (["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname)) {
            return {};
        }
    } catch {
        // Not a parseable URL; fall through to the safe default.
    }
    return { ssl: "require" };
}

// Initialize database connection (lazy)
function initializeDatabase() {
    if (_db) {
        return {db: _db, sql: _sql!};
    }

    const connectionString = getDatabaseUrl();

    console.log(
        "🔗 Initializing database connection:",
        connectionString.replace(/:[^:@]+@/, ":****@"),
    );

    // Create postgres connection
    _sql = postgres(connectionString, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
        ...sslOptions(connectionString),
    });

    // Create Drizzle ORM instance with the postgres connection
    _db = drizzle(_sql, {schema});

    return {db: _db, sql: _sql};
}

// Export getters that initialize on first access
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
    get(_, prop) {
        const {db} = initializeDatabase();
        return (db as any)[prop];
    },
});

// Export the raw SQL connection getter
export default new Proxy({} as ReturnType<typeof postgres>, {
    get(_, prop) {
        const {sql} = initializeDatabase();
        return (sql as any)[prop];
    },
    apply(_, __, args) {
        const {sql} = initializeDatabase();
        return (sql as any)(...args);
    },
});
