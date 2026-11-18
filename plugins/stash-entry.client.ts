// The hidden way into /stash, as on the old site: double-click the ".dev" in the footer
export default defineNuxtPlugin(() => {
    const localePath = useLocalePath();
    document.addEventListener("dblclick", (event) => {
        if ((event.target as Element).closest?.(".dev-mark")) navigateTo(localePath("/stash"));
    });
});
