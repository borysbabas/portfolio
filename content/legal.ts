import type { Locale } from "./site";

export interface LegalDoc {
    title: string;
    updated: string;
    intro: string;
    sections: { heading: string; paragraphs?: string[]; list?: string[] }[];
}

export const legal: Record<Locale, { privacy: LegalDoc; terms: LegalDoc }> = {
    en: {
        privacy: {
            title: "Privacy policy",
            updated: "Last updated 18 November 2026",
            intro: "This is the personal website of Borys Babas in Amsterdam. It collects as little as it can. For anything about your data, email info@borysbabas.dev.",
            sections: [
                {
                    heading: "What the site measures",
                    list: [
                        "Visit statistics through Vercel Web Analytics: which pages are viewed, the site you came from, and your country, browser and type of device. It uses no cookies and doesn't identify you; visits are counted with a code that is thrown away every day.",
                        "How fast pages load on your device, through Vercel Speed Insights, without identifying you.",
                        "Server logs at Vercel, the host, which include your IP address. They are kept for a short time to run and protect the site.",
                    ],
                },
                {
                    heading: "Other services your browser talks to",
                    list: [
                        "The fonts come from Google Fonts, so your browser shares your IP address with Google when a page loads.",
                        "The project images in Selected work load from GitHub.",
                        "Links to GitHub, LinkedIn and Instagram take you to those sites, which have their own privacy policies.",
                    ],
                },
                {
                    heading: "What is stored on your device",
                    paragraphs: [
                        "Your choice of light or dark mode is kept in your browser's local storage, and whether you've seen the intro animation is kept until you close the tab. Neither leaves your device. A private part of the site uses a sign-in cookie, but only its owner signs in there.",
                    ],
                },
                {
                    heading: "What the site doesn't do",
                    paragraphs: [
                        "There are no forms, accounts, newsletters, ads or tracking cookies, and no data is sold or shared for marketing.",
                    ],
                },
                {
                    heading: "Your rights",
                    paragraphs: [
                        "Under the GDPR you can ask which data about you is held, and have it corrected or deleted. Email info@borysbabas.dev. You can also file a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).",
                    ],
                },
                { heading: "Changes", paragraphs: ["When this policy changes, the date at the top changes with it."] },
            ],
        },
        terms: {
            title: "Terms of use",
            updated: "Last updated 18 November 2026",
            intro: "borysbabas.dev is the personal website of Borys Babas. By using it you accept these terms.",
            sections: [
                {
                    heading: "The content",
                    paragraphs: [
                        "The text, design and images on this site are mine unless stated otherwise. You're welcome to link to it and to quote short parts with a credit; ask before reusing anything more. Code on GitHub falls under the license of each repository.",
                    ],
                },
                {
                    heading: "Links to other sites",
                    paragraphs: ["The site links to other websites. I'm not responsible for their content or for how they handle your data."],
                },
                {
                    heading: "No guarantees",
                    paragraphs: [
                        "I do my best to keep the site correct and online, but I can't promise it is always complete, up to date or available. As far as the law allows, you use it at your own risk.",
                    ],
                },
                {
                    heading: "The private part",
                    paragraphs: ["Part of the site is private and meant only for its owner. Trying to get into it without permission is not allowed."],
                },
                { heading: "Law and contact", paragraphs: ["Dutch law applies to these terms. Questions? Email info@borysbabas.dev."] },
                { heading: "Changes", paragraphs: ["These terms can change; the date at the top shows the latest version."] },
            ],
        },
    },
    nl: {
        privacy: {
            title: "Privacybeleid",
            updated: "Laatst bijgewerkt op 18 november 2026",
            intro: "Dit is de persoonlijke website van Borys Babas in Amsterdam. De site verzamelt zo min mogelijk. Voor alles over je gegevens kun je mailen naar info@borysbabas.dev.",
            sections: [
                {
                    heading: "Wat de site meet",
                    list: [
                        "Bezoekstatistieken via Vercel Web Analytics: welke pagina's bekeken worden, van welke site je komt, en je land, browser en soort apparaat. Dit gebeurt zonder cookies en zonder je te identificeren; bezoeken worden geteld met een code die elke dag wordt weggegooid.",
                        "Hoe snel pagina's laden op jouw apparaat, via Vercel Speed Insights, zonder je te identificeren.",
                        "Serverlogs bij Vercel, de hostingpartij, met daarin je IP-adres. Die worden kort bewaard om de site te laten werken en te beveiligen.",
                    ],
                },
                {
                    heading: "Andere diensten waar je browser contact mee maakt",
                    list: [
                        "De lettertypes komen van Google Fonts, waardoor je browser je IP-adres met Google deelt als een pagina laadt.",
                        "De projectafbeeldingen bij Geselecteerd werk worden van GitHub geladen.",
                        "Links naar GitHub, LinkedIn en Instagram brengen je naar die sites, met hun eigen privacybeleid.",
                    ],
                },
                {
                    heading: "Wat er op je apparaat wordt opgeslagen",
                    paragraphs: [
                        "Je keuze voor lichte of donkere modus staat in de lokale opslag van je browser, en of je de introanimatie al hebt gezien blijft bewaard tot je het tabblad sluit. Geen van beide verlaat je apparaat. Een besloten deel van de site gebruikt een inlogcookie, maar daar logt alleen de eigenaar in.",
                    ],
                },
                {
                    heading: "Wat de site niet doet",
                    paragraphs: [
                        "Er zijn geen formulieren, accounts, nieuwsbrieven, advertenties of trackingcookies, en er worden geen gegevens verkocht of gedeeld voor marketing.",
                    ],
                },
                {
                    heading: "Je rechten",
                    paragraphs: [
                        "Volgens de AVG kun je vragen welke gegevens over jou worden bewaard, en die laten corrigeren of verwijderen. Mail naar info@borysbabas.dev. Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens.",
                    ],
                },
                { heading: "Wijzigingen", paragraphs: ["Als dit beleid verandert, verandert de datum bovenaan mee."] },
            ],
        },
        terms: {
            title: "Gebruiksvoorwaarden",
            updated: "Laatst bijgewerkt op 18 november 2026",
            intro: "borysbabas.dev is de persoonlijke website van Borys Babas. Door de site te gebruiken ga je akkoord met deze voorwaarden.",
            sections: [
                {
                    heading: "De inhoud",
                    paragraphs: [
                        "De teksten, het ontwerp en de afbeeldingen op deze site zijn van mij, tenzij anders vermeld. Je mag ernaar linken en korte stukken citeren met bronvermelding; vraag het eerst als je meer wilt hergebruiken. Code op GitHub valt onder de licentie van elke repository.",
                    ],
                },
                {
                    heading: "Links naar andere sites",
                    paragraphs: ["De site linkt naar andere websites. Ik ben niet verantwoordelijk voor hun inhoud of voor hoe zij met je gegevens omgaan."],
                },
                {
                    heading: "Geen garanties",
                    paragraphs: [
                        "Ik doe mijn best om de site juist en online te houden, maar kan niet beloven dat hij altijd volledig, actueel of bereikbaar is. Voor zover de wet het toestaat, gebruik je de site op eigen risico.",
                    ],
                },
                {
                    heading: "Het besloten deel",
                    paragraphs: ["Een deel van de site is besloten en alleen bedoeld voor de eigenaar. Proberen daar zonder toestemming binnen te komen is niet toegestaan."],
                },
                { heading: "Recht en contact", paragraphs: ["Op deze voorwaarden is Nederlands recht van toepassing. Vragen? Mail naar info@borysbabas.dev."] },
                { heading: "Wijzigingen", paragraphs: ["Deze voorwaarden kunnen veranderen; de datum bovenaan laat de nieuwste versie zien."] },
            ],
        },
    },
    pl: {
        privacy: {
            title: "Polityka prywatności",
            updated: "Ostatnia aktualizacja: 18 listopada 2026",
            intro: "To osobista strona internetowa Borysa Babasa z Amsterdamu. Zbiera tak mało danych, jak to możliwe. We wszystkich sprawach dotyczących Twoich danych napisz na info@borysbabas.dev.",
            sections: [
                {
                    heading: "Co mierzy strona",
                    list: [
                        "Statystyki odwiedzin przez Vercel Web Analytics: które strony są oglądane, z jakiej strony przychodzisz oraz Twój kraj, przeglądarka i rodzaj urządzenia. Odbywa się to bez plików cookie i bez identyfikowania Cię; wizyty są liczone za pomocą kodu, który codziennie jest usuwany.",
                        "Jak szybko strony ładują się na Twoim urządzeniu, przez Vercel Speed Insights, bez identyfikowania Cię.",
                        "Logi serwera w Vercel, firmie hostingowej, zawierające Twój adres IP. Są przechowywane krótko, aby strona działała i była bezpieczna.",
                    ],
                },
                {
                    heading: "Inne usługi, z którymi łączy się Twoja przeglądarka",
                    list: [
                        "Czcionki pochodzą z Google Fonts, więc podczas ładowania strony Twoja przeglądarka przekazuje Google Twój adres IP.",
                        "Zdjęcia projektów w sekcji Wybrane projekty ładują się z GitHuba.",
                        "Linki do GitHuba, LinkedIna i Instagrama prowadzą do tych serwisów, które mają własne polityki prywatności.",
                    ],
                },
                {
                    heading: "Co jest zapisywane na Twoim urządzeniu",
                    paragraphs: [
                        "Twój wybór trybu jasnego lub ciemnego jest zapisany w pamięci lokalnej przeglądarki, a informacja, czy animacja powitalna została już pokazana, jest przechowywana do zamknięcia karty. Żadna z nich nie opuszcza Twojego urządzenia. Prywatna część strony używa pliku cookie logowania, ale loguje się tam tylko jej właściciel.",
                    ],
                },
                {
                    heading: "Czego strona nie robi",
                    paragraphs: [
                        "Nie ma tu formularzy, kont, newslettera, reklam ani śledzących plików cookie, a dane nie są sprzedawane ani udostępniane w celach marketingowych.",
                    ],
                },
                {
                    heading: "Twoje prawa",
                    paragraphs: [
                        "Zgodnie z RODO możesz zapytać, jakie dane na Twój temat są przechowywane, oraz zażądać ich poprawienia lub usunięcia. Napisz na info@borysbabas.dev. Możesz też złożyć skargę do holenderskiego organu ochrony danych (Autoriteit Persoonsgegevens).",
                    ],
                },
                { heading: "Zmiany", paragraphs: ["Gdy ta polityka się zmieni, zmieni się też data na górze."] },
            ],
        },
        terms: {
            title: "Regulamin",
            updated: "Ostatnia aktualizacja: 18 listopada 2026",
            intro: "borysbabas.dev to osobista strona internetowa Borysa Babasa. Korzystając z niej, akceptujesz ten regulamin.",
            sections: [
                {
                    heading: "Treści",
                    paragraphs: [
                        "Teksty, projekt graficzny i zdjęcia na tej stronie należą do mnie, chyba że zaznaczono inaczej. Możesz do niej linkować i cytować krótkie fragmenty z podaniem źródła; zanim wykorzystasz coś więcej, zapytaj. Kod na GitHubie jest objęty licencją danego repozytorium.",
                    ],
                },
                {
                    heading: "Linki do innych stron",
                    paragraphs: ["Strona zawiera linki do innych serwisów. Nie odpowiadam za ich treść ani za to, jak przetwarzają Twoje dane."],
                },
                {
                    heading: "Brak gwarancji",
                    paragraphs: [
                        "Staram się, żeby strona była poprawna i dostępna, ale nie mogę obiecać, że zawsze będzie kompletna, aktualna i działająca. W granicach dozwolonych przez prawo korzystasz z niej na własne ryzyko.",
                    ],
                },
                {
                    heading: "Część prywatna",
                    paragraphs: ["Część strony jest prywatna i przeznaczona tylko dla jej właściciela. Próby dostania się do niej bez zgody są niedozwolone."],
                },
                { heading: "Prawo i kontakt", paragraphs: ["Regulamin podlega prawu holenderskiemu. Pytania? Napisz na info@borysbabas.dev."] },
                { heading: "Zmiany", paragraphs: ["Regulamin może się zmieniać; data na górze pokazuje najnowszą wersję."] },
            ],
        },
    },
};
