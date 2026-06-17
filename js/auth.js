const SUPABASE_URL = "https://vpznvbxgklqovibmoheq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwem52Ynhna2xxb3ZpYm1vaGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNDAyNTMsImV4cCI6MjA5NTcxNjI1M30.FgCN1knqpyi-2bb9U8tvSqC1mpGT15IyMyrM7BGJQRY";

let supabaseClient;

document.addEventListener("DOMContentLoaded", async () => {
    if (typeof supabase === "undefined") return;

    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    window.supabaseClient = supabaseClient;
    window.currentUser = null;
    window.currentUserId = null;

    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const loginStatus = document.getElementById("login-status");
    const registerStatus = document.getElementById("register-status");
    const forgotBtn = document.getElementById("forgot-password-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const dashboard = document.getElementById("dashboard");
    const dashboardEmail = document.getElementById("dashboard-email");
    const userIndicator = document.getElementById("user-indicator");

    document.querySelectorAll(".auth-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".auth-tab").forEach(t =>
                t.classList.remove("active")
            );

            tab.classList.add("active");

            const target = tab.getAttribute("data-auth-tab");

            document.querySelectorAll(".auth-form").forEach(form => {
                form.classList.toggle("active", form.id.startsWith(target));
            });
        });
    });

    async function refreshSessionUI() {
        const { data } = await supabaseClient.auth.getUser();
        const user = data?.user || null;

        window.currentUser = user;
        window.currentUserId = user ? user.id : null;

        if (dashboard) {
            dashboard.hidden = !user;
        }

        if (dashboardEmail) {
            dashboardEmail.textContent = user ? user.email : "";
        }

        if (userIndicator) {
            userIndicator.textContent = user ? user.email : "Login";
        }

        window.dispatchEvent(new Event("auth-change"));
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value;

            const { error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                loginStatus.textContent = error.message;
                loginStatus.className = "auth-status error";
                return;
            }

            loginStatus.textContent = "Logged in successfully";
            loginStatus.className = "auth-status success";

            await refreshSessionUI();
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("register-email").value.trim();
            const password = document.getElementById("register-password").value;

            const { error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin + "/login.html"
                }
            });

            if (error) {
                registerStatus.textContent = error.message;
                registerStatus.className = "auth-status error";
                return;
            }

            registerStatus.textContent = "Check your email to confirm account";
            registerStatus.className = "auth-status success";
        });
    }

    if (forgotBtn) {
        forgotBtn.addEventListener("click", async () => {
            const email = document.getElementById("login-email").value.trim();

            if (!email) {
                loginStatus.textContent = "Enter email first";
                loginStatus.className = "auth-status error";
                return;
            }

            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + "/login.html"
            });

            if (error) {
                loginStatus.textContent = error.message;
                loginStatus.className = "auth-status error";
            } else {
                loginStatus.textContent = "Reset email sent";
                loginStatus.className = "auth-status success";
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await supabaseClient.auth.signOut();
            await refreshSessionUI();
        });
    }

    await supabaseClient.auth.getSession();
    await refreshSessionUI();

    window.dispatchEvent(new Event("auth-ready"));

    supabaseClient.auth.onAuthStateChange(async () => {
        await refreshSessionUI();
        window.dispatchEvent(new Event("auth-ready"));
    });
});