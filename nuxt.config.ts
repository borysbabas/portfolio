import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: "2025-12-09",
    devtools: {enabled: process.env.NODE_ENV !== "production"},

    app: {
        head: {
            title: "borysbabas.dev",
            meta: [
                {
                    name: "description",
                    content: "borysbabas.dev, Borys' personal portfolio.",
                },
                {name: "viewport", content: "width=device-width, initial-scale=1"},
            ],
        },
    },

    css: ["/assets/css/main.css"],

    routeRules: {
        // The home page renders the GitHub project list; cache it at the edge so visitors never wait on GitHub.
        "/": {isr: 3600},
        // Pages that are gone. Redirect rather than 404 so existing links and
        // indexed results land somewhere useful.
        "/services": {redirect: {to: "/", statusCode: 301}},
        "/blog/**": {redirect: {to: "/", statusCode: 301}},
        "/sitemap": {redirect: {to: "/", statusCode: 301}},
        // Folded into sections of the one-page home.
        "/projects": {redirect: {to: "/#work", statusCode: 301}},
        "/interests": {redirect: {to: "/#about", statusCode: 301}},
        "/contact": {redirect: {to: "/#contact", statusCode: 301}},
    },

    vite: {
        plugins: [tailwindcss()],
    },

    modules: ["@nuxtjs/color-mode"],

    colorMode: {
        preference: "system", // default value if no preference is stored
        fallback: "dark", // fallback value if system can't be detected
        classSuffix: "", // Important for Tailwind's 'dark' class
        storageKey: "theme",
        dataValue: "theme", // Also sets <html data-theme>, which site.css keys on
    },

    runtimeConfig: {
        // Server-side only. Raises the GitHub API rate limit for /api/github/repos.
        githubToken: process.env.GITHUB_TOKEN || "",
    },
});
