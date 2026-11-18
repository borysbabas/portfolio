export default defineEventHandler(async (event) => {
    const session = await useStashSession(event);
    await session.clear();
    return { authed: false };
});
