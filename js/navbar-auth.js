/**
 * navbar-auth.js
 * Checks the Supabase session and shows the logged-in email in the navbar.
 * Works alongside the Login button — both are displayed when a user is signed in.
 */

const NAVBAR_SUPABASE_URL = "https://vpznvbxgklqovibmoheq.supabase.co";
const NAVBAR_SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwem52Ynhna2xxb3ZpYm1vaGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNDAyNTMsImV4cCI6MjA5NTcxNjI1M30.FgCN1knqpyi-2bb9U8tvSqC1mpGT15IyMyrM7BGJQRY";

/**
 * Truncates an email address so the navbar badge doesn't overflow on small screens.
 * e.g. "verylongemail@example.com" → "verylonge…@example.com"
 */
function truncateEmail(email, maxLocal = 10) {
    const [local, domain] = email.split("@");
    if (!domain) return email;
    const trimmed = local.length > maxLocal ? local.slice(0, maxLocal) + "…" : local;
    return `${trimmed}@${domain}`;
}

/**
 * Refreshes the navbar badge to reflect the current auth state.
 * Called once on load and again whenever the session changes.
 */
async function refreshNavbarAuth(client) {
    const { data } = await client.auth.getUser();
    const user = data?.user;

    const badge   = document.getElementById("nav-user-badge");
    const emailEl = document.getElementById("nav-user-email-text");
    if (!badge || !emailEl) return;

    if (user) {
        /* Translate the tooltip label using the current language */
        const dict = (typeof translations !== "undefined" && translations)
            ? (translations[localStorage.getItem("lang") || "en"] || translations.en)
            : {};
        const label = dict["nav.logged_in_as"] || "Logged in as";

        emailEl.textContent  = truncateEmail(user.email);
        badge.title          = `${label}: ${user.email}`;   // full email in tooltip
        badge.hidden         = false;
    } else {
        badge.hidden = true;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    /* Abort gracefully if the Supabase CDN failed to load */
    if (typeof supabase === "undefined") return;

    const client = supabase.createClient(NAVBAR_SUPABASE_URL, NAVBAR_SUPABASE_KEY);

    /* Initial check */
    await refreshNavbarAuth(client);

    /* Keep badge in sync when the user signs in or out from any tab */
    client.auth.onAuthStateChange(async () => {
        await refreshNavbarAuth(client);
    });

    /**
     * Re-translate the badge tooltip whenever the language toggle is clicked.
     * translations.js fires applyTranslations() but doesn't know about the tooltip,
     * so we re-apply it here using the same translations object.
     */
    const langToggle = document.getElementById("lang-toggle");
    if (langToggle) {
        langToggle.addEventListener("click", () => {
            /* Small delay so localStorage is updated before we read it */
            setTimeout(() => refreshNavbarAuth(client), 50);
        });
    }
});
