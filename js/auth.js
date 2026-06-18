const SUPABASE_URL = "https://vpznvbxgklqovibmoheq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwem52Ynhna2xxb3ZpYm1vaGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNDAyNTMsImV4cCI6MjA5NTcxNjI1M30.FgCN1knqpyi-2bb9U8tvSqC1mpGT15IyMyrM7BGJQRY";

let supabaseClient;

document.addEventListener("DOMContentLoaded", async () => {

    /* Stop if the Supabase library failed to load (no internet or CDN blocked) */
    if (typeof supabase === "undefined") return;

    /* Create a Supabase client using the project URL and public API key */
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    /* Get references to login/register forms and other UI elements */
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const loginStatus = document.getElementById("login-status");
    const registerStatus = document.getElementById("register-status");
    const forgotBtn = document.getElementById("forgot-password-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const dashboard = document.getElementById("dashboard");
    const dashboardEmail = document.getElementById("dashboard-email");

    /* Switch between Login and Register tabs by toggling the "active" class */
    document.querySelectorAll(".auth-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            /* Remove active from all tabs, then set it on the clicked one */
            document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            const target = tab.getAttribute("data-auth-tab");
            /* Show only the form that matches the selected tab */
            document.querySelectorAll(".auth-form").forEach((form) => {
                form.classList.toggle("active", form.id.startsWith(target));
            });
        });
    });

    /**
     * Updates the dashboard visibility based on the current Supabase session
     */
    async function refreshSessionUI() {
        /* Fetch the currently authenticated user from Supabase */
        const { data } = await supabaseClient.auth.getUser();
        const user = data?.user;
        if (user && dashboard) {
            /* User is logged in — show dashboard and display their email */
            dashboard.hidden = false;
            if (dashboardEmail) dashboardEmail.textContent = user.email;
        } else if (dashboard) {
            /* No active session — hide the dashboard */
            dashboard.hidden = true;
        }
    }

    /* Handle login form submission */
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            /* Clear any previous status message */
            loginStatus.textContent = "";
            loginStatus.className = "auth-status";

            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value;

            /* Attempt to sign in via Supabase with email and password */
            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

            if (error) {
                /* Display the error message returned by Supabase */
                loginStatus.textContent = error.message;
                loginStatus.classList.add("error");
            } else {
                loginStatus.textContent = "Logged in successfully.";
                loginStatus.classList.add("success");
                /* Refresh the dashboard to reflect the new session */
                await refreshSessionUI();
            }
        });
    }

    /* Handle register form submission */
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            /* Clear any previous status message */
            registerStatus.textContent = "";
            registerStatus.className = "auth-status";

            const email = document.getElementById("register-email").value.trim();
            const password = document.getElementById("register-password").value;

            /* Register a new user; Supabase sends a confirmation email */
            const { error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin + "/login.html"
                }
            });

            if (error) {
                registerStatus.textContent = error.message;
                registerStatus.classList.add("error");
            } else {
                /* Ask the user to check their inbox to confirm the account */
                registerStatus.textContent = "Check your email to confirm your account.";
                registerStatus.classList.add("success");
            }
        });
    }

    /* Handle "Forgot password" button click */
    if (forgotBtn) {
        forgotBtn.addEventListener("click", async () => {
            /* Clear any previous status message */
            loginStatus.textContent = "";
            loginStatus.className = "auth-status";

            const email = document.getElementById("login-email").value.trim();
            /* Require an email address before sending the reset link */
            if (!email) {
                loginStatus.textContent = "Enter your email first.";
                loginStatus.classList.add("error");
                return;
            }

            /* Send a password reset email via Supabase */
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + "/login.html"
            });

            if (error) {
                loginStatus.textContent = error.message;
                loginStatus.classList.add("error");
            } else {
                loginStatus.textContent = "Password reset email sent.";
                loginStatus.classList.add("success");
            }
        });
    }

    /* Handle logout button click */
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            /* Sign out from Supabase and update the dashboard */
            await supabaseClient.auth.signOut();
            await refreshSessionUI();
        });
    }

    /* Check for an existing session when the page first loads */
    await refreshSessionUI();
});
