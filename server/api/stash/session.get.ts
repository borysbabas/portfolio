export default defineEventHandler(async (event) => {
    const session = await useStashSession(event);
    return { authed: !!session.data.authed };
});
