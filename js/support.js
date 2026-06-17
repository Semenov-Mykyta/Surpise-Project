// EmailJS config – замените на свои значения
const EMAILJS_PUBLIC_KEY = "zWpLd3YXblspaCcRc";
const EMAILJS_SERVICE_ID = "service_knm5jpr";
const EMAILJS_TEMPLATE_ID = "template_t7dqfdg";

document.addEventListener("DOMContentLoaded", () => {
    if (typeof emailjs !== "undefined") {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    const form = document.getElementById("support-form");
    const statusEl = document.getElementById("support-status");
    const submitBtn = document.getElementById("support-submit");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        statusEl.textContent = "";
        statusEl.className = "form-status";
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        const name = document.getElementById("support-name").value.trim();
        const email = document.getElementById("support-email").value.trim();
        const subject = document.getElementById("support-subject").value.trim();
        const order = document.getElementById("support-order").value.trim();
        const message = document.getElementById("support-message").value.trim();

        if (!name || !email || !subject || !message) {
            statusEl.textContent = "Please fill in all required fields.";
            statusEl.classList.add("error");
            submitBtn.disabled = false;
            submitBtn.textContent = "Send message";
            return;
        }

        const templateParams = {
            name,
            email,
            subject,
            order,
            message
        };

        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
            statusEl.textContent = "Message sent successfully.";
            statusEl.classList.add("success");
            form.reset();
        } catch (err) {
            statusEl.textContent = "Something went wrong. Please try again.";
            statusEl.classList.add("error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send message";
        }
    });
});
