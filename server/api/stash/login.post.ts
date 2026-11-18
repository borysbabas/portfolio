const MAX_ATTEMPTS = 5;
const WINDOW = 15 * 60 * 1000;

type Attempt = { id: number; at: string };

const recentAttempts = () =>
    stashDb<Attempt[]>("stash_login_attempts", {
        query: { select: "id,at", at: `gte.${new Date(Date.now() - WINDOW).toISOString()}`, order: "at.asc" },
    });

const locked = (attempts: Attempt[]) => {
    const minutes = Math.max(1, Math.ceil((new Date(attempts[0]!.at).getTime() + WINDOW - Date.now()) / 60000));
    return createError({ statusCode: 429, statusMessage: `Too many wrong passwords. Try again in ${minutes} min.` });
};

/**
 * One lockout for everyone rather than per IP, which is trivial to get around by changing address.
 * The catch: someone hammering it keeps the owner locked out too, and gets an email about it.
 */
export default defineEventHandler(async (event) => {
    const { password } = await readBody<{ password?: unknown }>(event);

    // Locked: refuse before recording or checking anything, so an attack can't grow the table
    const before = await recentAttempts();
    if (before.length >= MAX_ATTEMPTS) throw locked(before);

    // The attempt is recorded before the password is checked, so a burst of parallel guesses
    // can't all slip under the limit: whoever lands past the fifth slot is turned away unchecked
    await stashDb("stash_login_attempts", { method: "POST", body: { at: new Date().toISOString() } });
    const attempts = await recentAttempts();
    if (attempts.length > MAX_ATTEMPTS) throw locked(attempts);

    if (typeof password !== "string" || !passwordMatches(password)) {
        if (attempts.length === MAX_ATTEMPTS) {
            // Best effort: a failed alert must not turn a wrong password into a server error
            await sendStashEmail(
                "Stash sign-in locked",
                `<p>Someone entered a wrong stash password ${MAX_ATTEMPTS} times in 15 minutes, so sign-in is locked for the next 15 minutes.</p>`,
            ).catch(() => {});
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const left = MAX_ATTEMPTS - attempts.length;
        throw createError({
            statusCode: 401,
            statusMessage: left > 0 ? `Wrong password. ${left} ${left === 1 ? "try" : "tries"} left.` : "Wrong password.",
        });
    }

    // Supabase refuses a DELETE without a filter; every id matches this one
    await stashDb("stash_login_attempts", { method: "DELETE", query: { id: "gt.0" } });
    const session = await useStashSession(event);
    await session.update({ authed: true });
    return { authed: true };
});
