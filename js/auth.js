const SUPABASE_URL = "https://vpznvbxgklqovibmoheq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwem52Ynhna2xxb3ZpYm1vaGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNDAyNTMsImV4cCI6MjA5NTcxNjI1M30.FgCN1knqpyi-2bb9U8tvSqC1mpGT15IyMyrM7BGJQRY";

let supabaseClient;

document.addEventListener("DOMContentLoaded", async () => {

    /* Stop if the Supabase library failed to load (no internet or CDN blocked) */
    if (typeof supabase === "undefined") return;

    /* Create a Supabase client using the project URL and public API key */
    supabaseClient = supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    /* Expose the Supabase client and user data globally so other scripts can access them */
    window.supabaseClient = supabaseClient;
    window.currentUser = null;
    window.currentUserId = null;

    /* Get references to login/register forms and other UI elements */
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    const loginStatus = document.getElementById("login-status");
    const registerStatus = document.getElementById("register-status");

    const forgotBtn = document.getElementById("forgot-password-btn");
    const logoutBtn = document.getElementById("logout-btn");

    const dashboard = document.getElementById("dashboard");
    const dashboardEmail = document.getElementById("dashboard-email");
    const userIndicator = document.getElementById("user-indicator");

    /* Switch between Login and Register tabs by toggling the "active" class */
    document.querySelectorAll(".auth-tab").forEach((tab) => {
        tab.addEventListener("click", () => {

            /* Remove active from all tabs, then set it on the clicked one */
            document
                .querySelectorAll(".auth-tab")
                .forEach(t => t.classList.remove("active"));

            tab.classList.add("active");

            const target = tab.getAttribute("data-auth-tab");

            /* Show only the form that matches the selected tab */
            document.querySelectorAll(".auth-form").forEach(form => {
                form.classList.toggle(
                    "active",
                    form.id.startsWith(target)
                );
            });
        });
    });

    /**
     * Updates the interface according to the current user session
     */
    async function refreshSessionUI() {

        /* Fetch the currently authenticated user from Supabase */
        const { data } = await supabaseClient.auth.getUser();

        const user = data?.user || null;

        /* Store user data globally so other scripts (e.g. cart.js) can access it */
        window.currentUser = user;
        window.currentUserId = user ? user.id : null;

        /* Show or hide the dashboard section depending on login state */
        if (dashboard) {
            dashboard.hidden = !user;
        }

        /* Display the logged-in user's email inside the dashboard */
        if (dashboardEmail) {
            dashboardEmail.textContent = user
                ? user.email
                : "";
        }

        /* Show email in the navbar indicator if logged in, or "Login" if not */
        if (userIndicator) {
            userIndicator.textContent = user
                ? user.email
                : "Login";
        }

        /* Notify other scripts (e.g. cart.js) that the auth state has changed */
        window.dispatchEvent(new Event("auth-change"));
    }

    /* Handle login form submission */
    if (loginForm) {

        loginForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const email =
                document.getElementById("login-email")
                    .value
                    .trim();

            const password =
                document.getElementById("login-password")
                    .value;

            /* Attempt to sign in via Supabase with email and password */
            const { error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) {

                /* Display the error message returned by Supabase */
                loginStatus.textContent = error.message;
                loginStatus.className = "auth-status error";
                return;
            }

            loginStatus.textContent =
                "Logged in successfully";

            loginStatus.className =
                "auth-status success";

            /* Refresh the UI to reflect the new logged-in state */
            await refreshSessionUI();
        });
    }

    /* Handle register form submission */
    if (registerForm) {

        registerForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const email =
                document.getElementById("register-email")
                    .value
                    .trim();

            const password =
                document.getElementById("register-password")
                    .value;

            /* Register a new user; Supabase sends a confirmation email */
            const { error } =
                await supabaseClient.auth.signUp({

                    email,
                    password,

                    options: {
                        emailRedirectTo:
                            window.location.origin +
                            "/login.html"
                    }
                });

            if (error) {

                registerStatus.textContent =
                    error.message;

                registerStatus.className =
                    "auth-status error";

                return;
            }

            /* Ask the user to check their email to confirm the account */
            registerStatus.textContent =
                "Check your email to confirm account";

            registerStatus.className =
                "auth-status success";
        });
    }

    /* Handle "Forgot password" button click */
    if (forgotBtn) {

        forgotBtn.addEventListener("click", async () => {

            const email =
                document.getElementById("login-email")
                    .value
                    .trim();

            /* Require an email address before sending the reset link */
            if (!email) {

                loginStatus.textContent =
                    "Enter email first";

                loginStatus.className =
                    "auth-status error";

                return;
            }

            /* Send a password reset email via Supabase */
            const { error } =
                await supabaseClient.auth
                    .resetPasswordForEmail(email, {

                        redirectTo:
                            window.location.origin +
                            "/login.html"
                    });

            if (error) {

                loginStatus.textContent =
                    error.message;

                loginStatus.className =
                    "auth-status error";

            } else {

                loginStatus.textContent =
                    "Reset email sent";

                loginStatus.className =
                    "auth-status success";
            }
        });
    }

    /* Handle logout button click */
    if (logoutBtn) {

        logoutBtn.addEventListener("click", async () => {

            /* Sign out from Supabase and update the UI */
            await supabaseClient.auth.signOut();

            await refreshSessionUI();
        });
    }

    /* Check whether an active session already exists on page load */
    await supabaseClient.auth.getSession();

    await refreshSessionUI();

    /* Signal to other scripts that the auth system has finished initializing */
    window.dispatchEvent(new Event("auth-ready"));

    /* Re-run UI update whenever auth state changes (login, logout, token refresh) */
    supabaseClient.auth.onAuthStateChange(async () => {

        await refreshSessionUI();

        window.dispatchEvent(
            new Event("auth-ready")
        );
    });
});